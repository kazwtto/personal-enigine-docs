import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const sourceRoot = path.resolve(
    process.argv[2] ??
        process.env.UNDERTALE_ENGINE_SOURCE ??
        "../UndertaleEngine",
);
const scriptsRoot = path.join(sourceRoot, "scripts");
const apiMarkdownPath = path.join(
    projectRoot,
    "documentation",
    "undertale-engine",
    "pt-BR",
    "guides",
    "api-reference.md",
);
const outputPath = path.join(
    projectRoot,
    "documentation",
    "undertale-engine",
    "pt-BR",
    "api-reference.json",
);

if (!fs.existsSync(scriptsRoot)) {
    throw new Error(
        `Diretório de scripts da engine não encontrado: ${scriptsRoot}`,
    );
}

const stripMarkdown = (value = "") =>
    value
        .replace(/<[^>]+>/g, "")
        .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
        .replace(/[`*_~]/g, "")
        .trim();

const slugify = (value) =>
    value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

function walk(directory) {
    return fs
        .readdirSync(directory, { withFileTypes: true })
        .flatMap((entry) => {
            const absolute = path.join(directory, entry.name);
            if (entry.isDirectory()) return walk(absolute);
            return entry.isFile() && entry.name.endsWith(".gml")
                ? [absolute]
                : [];
        });
}

function matchingBrace(text, openIndex) {
    let depth = 0;
    let quote = "";
    let escaped = false;
    let lineComment = false;
    let blockComment = false;

    for (let index = openIndex; index < text.length; index += 1) {
        const char = text[index];
        const next = text[index + 1];
        if (lineComment) {
            if (char === "\n") lineComment = false;
            continue;
        }
        if (blockComment) {
            if (char === "*" && next === "/") {
                blockComment = false;
                index += 1;
            }
            continue;
        }
        if (quote) {
            if (escaped) escaped = false;
            else if (char === "\\") escaped = true;
            else if (char === quote) quote = "";
            continue;
        }
        if (char === "/" && next === "/") {
            lineComment = true;
            index += 1;
            continue;
        }
        if (char === "/" && next === "*") {
            blockComment = true;
            index += 1;
            continue;
        }
        if (char === '"' || char === "'") {
            quote = char;
            continue;
        }
        if (char === "{") depth += 1;
        if (char === "}") {
            depth -= 1;
            if (depth === 0) return index;
        }
    }
    return text.length - 1;
}

function precedingComments(text, functionIndex) {
    const before = text.slice(Math.max(0, functionIndex - 1200), functionIndex);
    const block = before.match(/((?:\s*\/\/[^\n]*\n)+)\s*$/)?.[1] ?? "";
    return block
        .split("\n")
        .map((line) => line.replace(/^\s*\/\/\/?\s?/, "").trim())
        .filter(
            (line) =>
                line && !line.startsWith("@arg") && !line.startsWith("@param"),
        );
}

function documentedArguments(text, functionIndex) {
    const before = text.slice(Math.max(0, functionIndex - 900), functionIndex);
    const block = before.match(/((?:\s*\/\/\/[^\n]*\n)+)\s*$/)?.[1] ?? "";
    return [...block.matchAll(/@(?:arg|param)\s+([^\s\n]+)/g)].map(
        (match) => match[1],
    );
}

function extractSourceFunctions() {
    const all = [];
    const matcher = /function\s+([A-Za-z_][\w]*)\s*\(([^)]*)\)\s*([^\{]*)\{/g;

    for (const filePath of walk(scriptsRoot)) {
        const text = fs.readFileSync(filePath, "utf8");
        const matches = [];
        matcher.lastIndex = 0;
        let match;
        while ((match = matcher.exec(text))) {
            const open = match.index + match[0].lastIndexOf("{");
            const close = matchingBrace(text, open);
            const explicitArgs = match[2]
                .split(",")
                .map((arg) => arg.trim())
                .filter(Boolean);
            matches.push({
                localName: match[1],
                explicitArgs,
                documentedArgs: documentedArguments(text, match.index),
                constructor: /\bconstructor\b/.test(match[3]),
                inherits: match[3].match(/:\s*([A-Za-z_][\w]*)/)?.[1] ?? null,
                start: match.index,
                open,
                close,
                comments: precedingComments(text, match.index),
                body: text.slice(open + 1, close),
                sourcePath: path
                    .relative(sourceRoot, filePath)
                    .replaceAll("\\", "/"),
            });
        }

        for (const item of matches) {
            const owners = matches
                .filter(
                    (candidate) =>
                        candidate.constructor &&
                        candidate.start < item.start &&
                        candidate.close > item.close,
                )
                .sort((a, b) => a.close - a.start - (b.close - b.start));
            const owner = owners[0]?.localName ?? null;
            all.push({
                ...item,
                owner,
                name: owner ? `${owner}.${item.localName}` : item.localName,
            });
        }
    }

    const unique = new Map();
    for (const item of all.sort((a, b) => a.name.localeCompare(b.name))) {
        if (!unique.has(item.name)) unique.set(item.name, item);
    }
    return [...unique.values()];
}

function extractApiSeeds() {
    const markdown = fs.readFileSync(apiMarkdownPath, "utf8");
    const lines = markdown.split("\n");
    const seeds = new Map();
    let category = "API";
    let subcategory = "Geral";
    let owner = "";
    let inTextBlock = false;
    const pattern =
        /(?:new\s+)?(?:[A-Za-z_][\w]*\.)?[A-Za-z_][\w]*\([^()\n]*\)|\.[A-Za-z_][\w]*\([^()\n]*\)/g;

    const add = (source, description) => {
        for (const signature of source.match(pattern) ?? []) {
            const clean = signature.replace(/^new\s+/, "");
            const rawName = clean.slice(0, clean.indexOf("("));
            const name = rawName.startsWith(".")
                ? `${owner || "Estrutura"}${rawName}`
                : rawName;
            if (!seeds.has(name))
                seeds.set(name, {
                    signature: signature.trim(),
                    description: stripMarkdown(description),
                    category,
                    subcategory,
                });
        }
    };

    for (const line of lines) {
        const h2 = line.match(/^##\s+(.+)$/);
        const h3 = line.match(/^###\s+(.+)$/);
        if (h2) {
            category = stripMarkdown(h2[1]);
            subcategory = "Geral";
            owner = "";
            continue;
        }
        if (h3) {
            subcategory = stripMarkdown(h3[1]);
            owner = h3[1].match(/`(?:new\s+)?([A-Za-z_][\w]*)/)?.[1] ?? "";
            continue;
        }
        if (line.startsWith("```")) {
            inTextBlock = !inTextBlock;
            continue;
        }
        if (inTextBlock) {
            add(line, "");
            continue;
        }
        if (line.startsWith("|") && !/^\|\s*[-:]+/.test(line)) {
            const cells = line
                .split("|")
                .slice(1, -1)
                .map((cell) => cell.trim());
            if (cells.length >= 2) add(cells[0], cells[1]);
        }
    }
    return seeds;
}

const DESCRIPTION_OVERRIDES = {
    Battle_SetEnemy:
        "Coloca um objeto ou uma instância de inimigo em um dos três slots da batalha, inicializa sua posição e dispara o evento de inicialização.",
    Battle_RemoveEnemy:
        "Desvincula o inimigo de um slot da batalha. A função limpa o registro do slot, mas não destrói a instância automaticamente.",
    Battle_SetEnemyDEF:
        "Define a defesa usada pela engine ao calcular o dano de FIGHT contra o inimigo do slot informado.",
    Battle_SetEnemyCenterPos:
        "Define o centro visual do inimigo, usado por animações, barras de dano e outros elementos da interface de batalha.",
    Battle_SetEnemyActionNumber:
        "Define quantas opções ACT o inimigo oferece no menu de batalha.",
    Battle_SetEnemyActionName:
        "Define o texto exibido para uma opção ACT específica do inimigo.",
    Battle_SetEnemySpareable:
        "Marca ou desmarca o inimigo como poupável, controlando o estado amarelo e a disponibilidade de SPARE.",
    Battle_CallEnemyEvent:
        "Dispara um User Event da API de batalha em um inimigo específico ou em todos os slots ocupados.",
    Battle_SetTurnInfo:
        "Grava uma opção do próximo turno defensivo, como objeto do turno, tamanho do quadro, posição ou comportamento de preparação.",
    Battle_SetTurnTime:
        "Define quantos frames restam no turno defensivo atual.",
    Battle_EndTurn:
        "Finaliza o turno defensivo, remove os projéteis e o controlador do padrão, incrementa a rodada e avança o fluxo da batalha.",
    Battle_IsBulletValid:
        "Verifica se um objeto ou uma instância pertence à hierarquia de `battle_bullet` e pode ser usado como projétil pela engine.",
    Battle_CallBulletEventSoulCollision:
        "Quando chamada pela alma, dispara no projétil o evento reservado para colisão com a alma.",
    Battle_CallSoulEventBulletCollision:
        "Quando chamada pelo projétil, encaminha a colisão para a alma processar dano, invencibilidade e efeitos.",
    Battle_SetSoul:
        "Troca a alma atual por um objeto válido derivado de `battle_soul`.",
    Player_SetHp:
        "Grava o HP atual do jogador. Esta função não limita o valor automaticamente; use `Player_Heal` ou `Player_Hurt` quando quiser aplicar limites seguros.",
    Player_SetHpMax: "Grava o HP máximo do jogador na área estática do save.",
    Player_GetHp: "Retorna o HP atual armazenado para o jogador.",
    Player_GetHpMax: "Retorna o HP máximo atual do jogador.",
    Player_Heal:
        "Cura o jogador sem ultrapassar o HP máximo e retorna o novo valor de HP.",
    Player_Hurt:
        "Reduz o HP do jogador sem permitir valores abaixo de zero e retorna o novo HP.",
    Player_CalculateDamage:
        "Calcula o dano recebido pelo jogador aplicando sua defesa total e os limites mínimo e máximo informados.",
    Dialog_Add:
        "Adiciona um texto ao fim da fila global de diálogos. A caixa só é aberta quando `Dialog_Start` é chamada.",
    Dialog_Start:
        "Abre a interface de diálogo e inicia o consumo da fila criada com `Dialog_Add`.",
    Encounter_Set:
        "Registra ou substitui um encontro, definindo até três inimigos, texto inicial, música, fuga, transição e posição da alma.",
    Encounter_Start:
        "Inicia um encontro registrado e executa a transição para a sala de batalha.",
    Item_Custom:
        "Ponto de extensão executado na inicialização para registrar tipos de item e inventários personalizados.",
    Item_GetInventoryItems:
        "Retorna o inventário principal de itens do jogador.",
    Item_GetInventoryPhones:
        "Retorna o inventário usado pelo menu de telefone.",
    Item_GetInventoryBoxes:
        "Retorna uma das caixas registradas para armazenamento de itens.",
    "Inventory.Add":
        "Adiciona um item ao fim do inventário se o ID estiver registrado e ainda houver capacidade.",
    "Inventory.Insert":
        "Insere um item na posição informada, deslocando os itens seguintes, se houver espaço.",
    "Inventory.Set":
        "Substitui o item de uma posição ocupada. Passar `ITEM_EMPTY` remove o item.",
    "Inventory.Remove":
        "Remove o item da posição informada e compacta o inventário.",
    "Inventory.Normalize":
        "Remove IDs inválidos e espaços vazios, compactando o inventário e respeitando sua capacidade.",
    "ItemType.OnUse":
        "Callback chamado quando o jogador usa este tipo de item. Sobrescreva-o para implementar cura, equipamento ou outro efeito.",
    "ItemType.OnInfo":
        "Callback chamado quando o jogador pede informações sobre este tipo de item.",
    "ItemType.OnDrop":
        "Callback chamado ao descartar o item. A implementação base mostra um diálogo e remove a entrada do inventário.",
    "RegisterManager.Register":
        "Associa um ID textual único a um conteúdo. IDs vazios ou repetidos são rejeitados.",
    "RegisterManager.Get":
        "Obtém um conteúdo registrado e mostra erro fatal quando o ID não existe.",
    "RegisterManager.GetOrUndefined":
        "Obtém um conteúdo registrado ou retorna `undefined` quando o ID não existe.",
    Storage_SaveGame:
        "Salva as zonas persistentes do jogo e atualiza as informações resumidas do slot atual.",
    Storage_LoadGame:
        "Carrega o save do slot atual e restaura as zonas persistentes registradas.",
};

const SUBJECTS = [
    [
        "MenuChoiceMercyOverrideNumber",
        "quantidade de opções personalizadas do menu MERCY",
    ],
    [
        "MenuChoiceMercyOverrideName",
        "nome de uma opção personalizada do menu MERCY",
    ],
    ["MenuChoiceMercyOverride", "menu MERCY personalizado"],
    ["MenuChoiceEnemy", "alvo selecionado no menu"],
    ["MenuChoiceAction", "ACT selecionado"],
    ["MenuChoiceItem", "item selecionado"],
    ["MenuChoiceButton", "botão principal selecionado"],
    ["MenuFightDamageTime", "tempo da etapa de dano do FIGHT"],
    ["MenuFightAnimTime", "tempo da animação de FIGHT"],
    ["MenuFightDamage", "dano calculado pelo menu FIGHT"],
    ["EnemyCenterPos", "centro visual do inimigo"],
    ["EnemyActionNumber", "quantidade de ACTs do inimigo"],
    ["EnemyActionName", "nome de um ACT do inimigo"],
    ["EnemySpareable", "estado poupável do inimigo"],
    ["EnemyNumber", "quantidade de inimigos ativos"],
    ["EnemyName", "nome do inimigo"],
    ["EnemyDEF", "defesa do inimigo"],
    ["Enemy", "inimigo"],
    ["BoardSurface", "surface do quadro de batalha"],
    ["BoardTransforming", "animação do quadro de batalha"],
    ["TurnPreparationAutoEnd", "fim automático da preparação do turno"],
    ["TurnPreparation", "preparação do turno"],
    ["TurnNumber", "número da rodada defensiva"],
    ["TurnTime", "tempo restante do turno"],
    ["TurnInfo", "configuração do turno"],
    ["Turn", "turno defensivo"],
    ["PlayerTempAtk", "bônus temporário de ATK"],
    ["PlayerTempDef", "bônus temporário de DEF"],
    ["PlayerTempSpd", "bônus temporário de velocidade"],
    ["PlayerTempInv", "bônus temporário de invencibilidade"],
    ["HpMax", "HP máximo"],
    ["Hp", "HP"],
    ["Atk", "ATK"],
    ["Def", "DEF"],
    ["Spd", "velocidade"],
    ["Inv", "invencibilidade"],
    ["Exp", "EXP"],
    ["Gold", "GOLD"],
    ["BGM", "música"],
    ["Dialog", "diálogo"],
    ["Soul", "alma"],
    ["Bullet", "projétil"],
    ["Inventory", "inventário"],
    ["Item", "item"],
    ["State", "estado"],
    ["Menu", "menu"],
];

function subjectFor(name) {
    const local = operationName(name).replace(
        /^(Get|Set|Is|Add|Remove|Create|Destroy|Start|End|Call|Convert|Update|Calculate|Invoke|Reward|Load|Save|Register|Contains|Clear|Normalize|Fade|Goto)/,
        "",
    );
    for (const [token, subject] of SUBJECTS)
        if (local.includes(token)) return subject;
    return (
        local
            .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
            .replace(/_/g, " ")
            .trim()
            .toLowerCase() || "operação"
    );
}

function operationName(name) {
    const local = name.split(".").pop();
    return local.includes("_") ? local.split("_").slice(1).join("_") : local;
}

function categoryFor(item) {
    const name = item.name;
    const local = name.split(".").pop();
    if (
        /Bullet|Projectile/i.test(name) ||
        /battle_bullet/i.test(item.sourcePath)
    )
        return [
            "Padrões de bala",
            /Collision|Hurt|Damage/.test(local)
                ? "Colisão e dano"
                : /Create|Destroy|Remove/.test(local)
                  ? "Criação e limpeza"
                  : "Projéteis",
        ];
    if (/^Battle_.*Enemy|^Battle_CallEnemy|battle_enemy/i.test(name))
        return [
            "Inimigos",
            /Action|Mercy|Spare/.test(local)
                ? "ACT e MERCY"
                : /DEF|Damage|Hp|Hurt/.test(local)
                  ? "Vida, defesa e dano"
                  : /Event|Call/.test(local)
                    ? "Ciclo e eventos"
                    : "Definição do inimigo",
        ];
    if (
        /^Player_/.test(name) &&
        /Hp|Heal|Hurt|Damage|Atk|Def|Lv|Exp|Kills/.test(local)
    )
        return [
            "Vida e dano",
            /Hp|Heal|Hurt/.test(local)
                ? "HP e cura"
                : /Damage|Atk|Def/.test(local)
                  ? "Cálculo de dano"
                  : "Nível e progressão",
        ];
    if (/FightDamage|RewardExp|RewardGold/.test(name))
        return ["Vida e dano", "Dano e recompensas da batalha"];
    if (/^Item_|Inventory|ItemType/.test(name))
        return [
            "Itens e inventários",
            /Inventory/.test(name)
                ? "Inventários"
                : /ItemType/.test(name)
                  ? "Tipos de item"
                  : "Registro e acesso",
        ];
    if (/^Encounter_/.test(name))
        return [
            "Encontros",
            /Start|End/.test(local)
                ? "Fluxo do encontro"
                : "Configuração do encontro",
        ];
    if (/^Dialog_|^Text_|TextTyper|text_/i.test(name))
        return [
            "Diálogos e texto",
            /Choice/.test(local)
                ? "Escolhas"
                : /Command|Typer/.test(local)
                  ? "Renderização e comandos"
                  : "Fila de diálogos",
        ];
    if (/^Lang_/.test(name))
        return [
            "Localização",
            /Font|Sprite/.test(local)
                ? "Recursos localizados"
                : "Textos e idiomas",
        ];
    if (/^Storage_|StorageZone/.test(name))
        return [
            "Saves e dados",
            /Save|Load|File/.test(local)
                ? "Salvar e carregar"
                : /Zone/.test(name)
                  ? "Zonas de armazenamento"
                  : "Acesso aos dados",
        ];
    if (/^BGM_|Audio|Sound/i.test(name))
        return [
            "Áudio",
            /Pause|Resume|Stop/.test(local)
                ? "Controle de reprodução"
                : "Músicas e slots",
        ];
    if (/^Input_/.test(name))
        return [
            "Entrada",
            /Bind/.test(local) ? "Mapeamento de controles" : "Leitura de ações",
        ];
    if (/^Anim_|Tween/i.test(name))
        return [
            "Animações",
            /Tween/.test(name) ? "Tweens" : "Ciclo de animação",
        ];
    if (/Camera|^View_/.test(name))
        return ["Câmera e tela", "Transformação e enquadramento"];
    if (/^Player_/.test(name))
        return [
            "Jogador",
            /Room|Plot/.test(local)
                ? "Mundo e história"
                : /Item|Inventory/.test(local)
                  ? "Equipamento"
                  : "Dados do jogador",
        ];
    if (/^Battle_/.test(name))
        return [
            "Batalha",
            /Menu/.test(local)
                ? "Menus"
                : /Turn/.test(local)
                  ? "Turnos"
                  : /State|Goto|End/.test(local)
                    ? "Fluxo e estados"
                    : "Consultas e configuração",
        ];
    if (/^Demo_/.test(name)) return ["Demos e replay", "Gravação e reprodução"];
    if (/^Camera_|Fade|Fader|Shaker|Border/.test(name))
        return ["Efeitos visuais", "Tela e transições"];
    if (item.owner || /Manager|Struct|Zone/.test(name))
        return ["Estruturas e gerenciadores", item.owner ?? "Construtores"];
    return ["Utilitários", "Funções gerais"];
}

const DOMAIN_PURPOSE = {
    "Padrões de bala":
        "Construir e controlar os projéteis e as colisões dos turnos defensivos.",
    Inimigos:
        "Configurar o inimigo, seus eventos, ACTs, defesa e estado de MERCY.",
    "Vida e dano": "Ler e alterar HP, atributos, dano, EXP e recompensas.",
    "Itens e inventários":
        "Registrar tipos de item e manipular inventários com segurança.",
    Encontros: "Registrar composições de inimigos e iniciar batalhas.",
    "Diálogos e texto":
        "Enfileirar falas, abrir caixas e controlar a renderização de texto.",
    Localização: "Carregar textos e recursos adequados ao idioma selecionado.",
    "Saves e dados":
        "Organizar dados persistentes e executar operações de save/load.",
    Áudio: "Controlar músicas e sons usados pela engine.",
    Entrada: "Ler ações e configurar controles de teclado e gamepad.",
    Animações: "Criar e atualizar animações e interpolações temporizadas.",
    "Câmera e tela":
        "Controlar enquadramento, escala e transformações visuais.",
    Jogador: "Consultar e alterar os dados centrais do jogador.",
    Batalha: "Controlar o fluxo, os menus e os estados da batalha.",
    "Estruturas e gerenciadores":
        "Usar as estruturas reutilizáveis que sustentam os sistemas da engine.",
    Utilitários:
        "Executar uma operação auxiliar reutilizada por outros sistemas.",
};

function fallbackDescription(item, category) {
    const local = operationName(item.name);
    const subject = subjectFor(item.name);
    if (/^Get/.test(local))
        return `Retorna ${subject} no contexto de ${category.toLowerCase()}.`;
    if (/^Set/.test(local))
        return `Define ${subject} usado pelo sistema de ${category.toLowerCase()}.`;
    if (/^Is/.test(local))
        return `Verifica se ${subject} atende à condição esperada pela engine.`;
    if (/^Add/.test(local))
        return `Adiciona ${subject} à estrutura correspondente.`;
    if (/^Remove/.test(local))
        return `Remove ${subject} da estrutura correspondente.`;
    if (/^Create/.test(local))
        return `Cria ${subject} e devolve uma referência para o novo recurso quando aplicável.`;
    if (/^Destroy/.test(local))
        return `Destrói ou libera ${subject} criado anteriormente.`;
    if (/^Start/.test(local))
        return `Inicia ${subject} e prepara o estado necessário para sua execução.`;
    if (/^End/.test(local))
        return `Finaliza ${subject}, limpa o estado temporário e avança o fluxo quando aplicável.`;
    if (/^Init/.test(local))
        return `Inicializa os dados internos de ${category.toLowerCase()}. Normalmente é chamada pelo controlador \`world\`.`;
    if (/^Uninit/.test(local))
        return `Libera os dados internos de ${category.toLowerCase()}. Normalmente é chamada pelo controlador \`world\`.`;
    if (/^Call/.test(local))
        return `Encaminha um evento relacionado a ${subject} para o objeto responsável.`;
    if (/^Convert/.test(local))
        return `Converte ${subject} entre as representações usadas pela engine.`;
    if (/^Save/.test(local))
        return `Salva ${subject} no armazenamento configurado.`;
    if (/^Load/.test(local))
        return `Carrega ${subject} do armazenamento configurado.`;
    if (/^Calculate/.test(local))
        return `Calcula ${subject} sem alterar diretamente o fluxo principal.`;
    if (/^Clear|^Normalize/.test(local))
        return `Reorganiza ou limpa ${subject} para manter a estrutura em um estado válido.`;
    return `Executa a operação ${local} no sistema de ${category.toLowerCase()}.`;
}

function useCaseFor(item, category) {
    const local = operationName(item.name);
    const subject = subjectFor(item.name);
    if (/^Get/.test(local))
        return `Use quando precisar consultar ${subject} sem alterar o estado da engine.`;
    if (/^Set/.test(local))
        return `Use durante a configuração ou no evento que precisa alterar ${subject}.`;
    if (/^Is|^Contains/.test(local))
        return "Use antes de executar uma operação que exige validação, evitando chamadas com IDs, slots ou objetos inválidos.";
    if (/^Add|^Insert|^Register/.test(local))
        return `Use ao incluir ${subject} na estrutura correspondente.`;
    if (/^Remove|^Clear|^Destroy/.test(local))
        return `Use quando ${subject} não deve mais participar do estado atual.`;
    if (/^Start|^End/.test(local))
        return `Use no ponto em que o fluxo de ${category.toLowerCase()} precisa avançar de etapa.`;
    if (/^Init|^Uninit|^Step/.test(local))
        return "Esta é uma função de ciclo interno. Só chame manualmente ao substituir conscientemente o controlador padrão da engine.";
    return `Use em código que trabalha diretamente com ${category.toLowerCase()} e precisa desta operação específica.`;
}

const ARGUMENT_DOCS = {
    enemy_slot: [
        "real",
        "Slot fixo do inimigo na batalha. Aceita `0`, `1` ou `2`.",
    ],
    slot: [
        "real",
        "Índice do slot que será consultado ou alterado. Confira o intervalo aceito pelo sistema.",
    ],
    action_slot: [
        "real",
        "Índice da opção ACT dentro da lista do inimigo, começando em `0`.",
    ],
    enemy_obj: [
        "object | instance",
        "Objeto filho de `battle_enemy` ou instância válida de inimigo.",
    ],
    "enemy_obj/inst": [
        "object | instance",
        "Objeto filho de `battle_enemy` ou instância válida de inimigo.",
    ],
    "bullet_obj/inst": [
        "object | instance",
        "Objeto filho de `battle_bullet` ou instância válida de projétil.",
    ],
    "obj/inst": [
        "object | instance",
        "Objeto ou instância aceito pela validação desta função.",
    ],
    soul_obj: [
        "object",
        "Objeto filho de `battle_soul` que passará a representar a alma.",
    ],
    turn_obj: [
        "object",
        "Objeto filho de `battle_turn` que controla o padrão defensivo.",
    ],
    event: [
        "enum",
        "Evento da enum correspondente ao sistema. Em inimigos, use `BATTLE_ENEMY_EVENT`.",
    ],
    index: ["real", "Índice da entrada, começando em `0`."],
    id: ["string", "Identificador único usado no registro."],
    itemId: ["string", "ID de um tipo de item previamente registrado."],
    item_id: ["string", "ID de um tipo de item previamente registrado."],
    inventory: ["Inventory", "Instância do inventário que contém o item."],
    itemTypeManager: [
        "ItemTypeManager",
        "Gerenciador responsável por validar e resolver IDs de item.",
    ],
    capacity: ["real", "Quantidade máxima de entradas do inventário."],
    amount: ["real", "Quantidade que será adicionada ou aplicada."],
    damage: [
        "real",
        "Quantidade de dano antes ou depois dos modificadores, conforme a função.",
    ],
    base: ["real", "Valor base usado no cálculo."],
    hp: ["real", "Novo valor de HP atual."],
    hpMax: ["real", "Novo limite máximo de HP."],
    heal_hp: ["real", "Quantidade de HP recuperada."],
    value: ["any", "Novo valor que será gravado."],
    info: [
        "enum | string",
        "Chave que identifica a opção ou informação dentro do sistema.",
    ],
    text: [
        "string",
        "Texto que será exibido ou armazenado. Aceita os comandos de texto da engine quando aplicável.",
    ],
    name: ["string", "Nome exibido pela interface."],
    bool: ["boolean", "Use `true` para ativar e `false` para desativar."],
    enabled: ["boolean", "Use `true` para ativar e `false` para desativar."],
    time: [
        "real",
        "Duração em frames, salvo quando a função declarar outra unidade.",
    ],
    x: ["real", "Coordenada horizontal no espaço usado pelo sistema."],
    y: ["real", "Coordenada vertical no espaço usado pelo sistema."],
    alpha: ["real", "Opacidade, normalmente entre `0` e `1`."],
    arr: ["array", "Array que substituirá os dados atuais."],
    func: ["function", "Função/callback chamado pela estrutura."],
    default: [
        "any",
        "Valor devolvido quando a informação solicitada não existe.",
    ],
};

function typeForArg(name) {
    const key = name.replace(/=.*/, "").trim();
    if (ARGUMENT_DOCS[key]) return ARGUMENT_DOCS[key][0];
    if (/bool|enable|pause|quick|choice|flee|locked|auto/i.test(key))
        return "boolean";
    if (/obj|object|inst|target/i.test(key)) return "object | instance";
    if (/text|name|key|file|path/i.test(key)) return "string";
    if (/arr|array|list/i.test(key)) return "array";
    if (/func|callback/i.test(key)) return "function";
    if (
        /slot|index|number|count|time|amount|damage|hp|atk|def|spd|inv|exp|gold|lv|x|y|width|height|scale|angle|alpha|min|max/i.test(
            key,
        )
    )
        return "real";
    return "any";
}

function descriptionForArg(name, category) {
    const key = name.replace(/=.*/, "").trim();
    if (ARGUMENT_DOCS[key]) return ARGUMENT_DOCS[key][1];
    return `Valor de \`${key}\` usado pela operação de ${category.toLowerCase()}.`;
}

function parseSignatureArgs(signature) {
    const open = signature.indexOf("(");
    const close = signature.lastIndexOf(")");
    if (open < 0 || close <= open) return [];
    return signature
        .slice(open + 1, close)
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean);
}

function returnInfo(item) {
    const local = operationName(item.name);
    const expressions = [
        ...item.body.matchAll(/\breturn(?:\s+([^;\n]+))?\s*;/g),
    ]
        .map((match) => match[1]?.trim())
        .filter(Boolean);
    if (/^Is|^Contains/.test(local))
        return {
            type: "boolean",
            description:
                "Retorna `true` quando a condição é atendida; caso contrário, `false`.",
        };
    if (expressions.length && /^(Add|Insert|Remove|Register|Clear)/.test(local))
        return {
            type: "boolean",
            description:
                "Retorna `true` quando a operação é concluída e `false` quando capacidade, índice ou validação impedem a mudança.",
        };
    if (
        expressions.some((value) => value === "true" || value === "false") ||
        (expressions.some((value) => value === "true") &&
            expressions.some((value) => value === "false"))
    ) {
        return {
            type: "boolean",
            description:
                "Retorna `true` quando a operação é aceita e `false` quando a validação falha.",
        };
    }
    if (!expressions.length)
        return {
            type: "undefined",
            description:
                "Não retorna um valor útil. O resultado ocorre por alteração do estado.",
        };
    if (/^Get/.test(local))
        return {
            type: "any",
            description:
                "Retorna o valor solicitado. O tipo exato depende do dado consultado.",
        };
    if (/Create|Add|Insert|Register/.test(local))
        return {
            type: "any",
            description:
                "Retorna o resultado da criação/operação; consulte as validações para saber quando pode ser `false` ou `undefined`.",
        };
    return {
        type: "any",
        description: "Retorna o resultado calculado pela função.",
    };
}

function effectsFor(item) {
    const effects = [];
    const body = item.body;
    if (/Storage_|\.Set\(|buffer_save|json_stringify/.test(body))
        effects.push("Altera dados mantidos pelo sistema de armazenamento.");
    if (/battle\.|Battle_Set|Battle_End|Battle_Goto/.test(body))
        effects.push("Pode alterar o estado atual da batalha.");
    if (/instance_create|instance_destroy|instance_change/.test(body))
        effects.push("Cria, destrói ou substitui instâncias do GameMaker.");
    if (/audio_|BGM_/.test(body))
        effects.push("Pode iniciar, pausar ou alterar áudio.");
    if (
        /ds_(queue|list|map)|array_(insert|delete|resize)|struct_set/.test(body)
    )
        effects.push("Modifica uma coleção mantida pela engine.");
    if (/global\./.test(body))
        effects.push("Lê ou altera estado global da engine.");
    if (/event_user|event_perform/.test(body))
        effects.push("Dispara um evento em outra instância.");
    if (
        !effects.length &&
        !/^Get|^Is|^Contains|^Calculate/.test(operationName(item.name))
    )
        effects.push(
            "Pode alterar o estado da estrutura ou sistema associado.",
        );
    return [...new Set(effects)];
}

function notesFor(item, signature, category) {
    const notes = [];
    const local = operationName(item.name);
    if (/show_error\(/.test(item.body))
        notes.push(
            "A implementação valida argumentos e pode chamar `show_error` quando encontra um valor fora do intervalo ou um ID inexistente.",
        );
    if (/^Init|^Uninit|^Step/.test(local))
        notes.push(
            "Função de ciclo interno: o objeto `world` normalmente faz esta chamada.",
        );
    if (
        /enemy_slot/.test(signature) ||
        (category === "Inimigos" && /\bslot\b/.test(signature))
    )
        notes.push("Os slots de inimigo válidos são `0`, `1` e `2`.");
    if (category === "Padrões de bala")
        notes.push(
            "Use objetos filhos de `battle_bullet`; o dano e a reação final também dependem da alma ativa.",
        );
    if (item.name === "Player_SetHp")
        notes.push(
            "Não há clamp nesta função. Valores acima do máximo ou abaixo de zero só são evitados por `Player_Heal` e `Player_Hurt`.",
        );
    if (item.name === "Battle_RemoveEnemy")
        notes.push(
            "A função não executa `instance_destroy`; destrua a instância separadamente quando necessário.",
        );
    if (item.name === "Battle_SetEnemy")
        notes.push(
            "Não altere `_enemy_slot` manualmente; a engine preenche esse campo e chama `BATTLE_ENEMY_EVENT.INIT`.",
        );
    return notes;
}

const SAMPLE_VALUES = {
    enemy_slot: "0",
    slot: "0",
    action_slot: "0",
    index: "0",
    number: "1",
    count: "1",
    enemy_obj: "obj_enemy_example",
    "enemy_obj/inst": "obj_enemy_example",
    "bullet_obj/inst": "obj_bullet_example",
    soul_obj: "battle_soul_red",
    turn_obj: "obj_turn_example",
    event: "BATTLE_ENEMY_EVENT.INIT",
    itemId: "ITEM_BANDAGE",
    item_id: "ITEM_BANDAGE",
    id: '"example"',
    name: '"Example"',
    text: '"* Texto de exemplo."',
    amount: "5",
    damage: "5",
    base: "10",
    hp: "20",
    hpMax: "20",
    heal_hp: "5",
    value: "1",
    info: "info_key",
    bool: "true",
    enabled: "true",
    time: "30",
    x: "320",
    y: "240",
    alpha: "1",
    capacity: "8",
    default: "0",
    arr: "[]",
    func: "function() {}",
    inventory: "Item_GetInventoryItems()",
    itemTypeManager: "Item_GetTypeManager()",
};

const EXAMPLE_OVERRIDES = {
    Battle_SetEnemy:
        '// obj_enemy_example deve ser filho de battle_enemy.\nvar success = Battle_SetEnemy(obj_enemy_example, 0);\nif (!success) {\n    show_debug_message("Objeto ou slot inválido");\n}',
    Battle_SetTurnInfo:
        "// Configura um turno de 4 segundos a 30 FPS.\nBattle_SetTurnInfo(BATTLE_TURN.TIME, 120);\nBattle_SetTurnInfo(BATTLE_TURN.BOARD_UP, 65);\nBattle_SetTurnInfo(BATTLE_TURN.BOARD_DOWN, 65);",
    Battle_GetTurnInfo:
        "var duration = Battle_GetTurnInfo(BATTLE_TURN.TIME, 120);\nshow_debug_message(duration);",
    Battle_IsBulletValid:
        '// obj_bullet_example deve ser filho de battle_bullet.\nif (Battle_IsBulletValid(obj_bullet_example)) {\n    show_debug_message("Projétil válido");\n}',
    Player_SetHp:
        "// Define diretamente o HP atual. Esta chamada não aplica limites.\nPlayer_SetHp(20);",
    Player_Heal:
        "var hp_after_heal = Player_Heal(5);\nshow_debug_message(hp_after_heal);",
    Player_Hurt:
        'var hp_after_damage = Player_Hurt(3);\nif (hp_after_damage <= 0) {\n    show_debug_message("Jogador derrotado");\n}',
    Dialog_Add:
        'Dialog_Add("* Olá!&* Esta é uma nova linha.");\nDialog_Start();',
    "Inventory.Add":
        'var items = Item_GetInventoryItems();\nif (!items.Add(ITEM_BANDAGE)) {\n    show_debug_message("Inventário cheio ou item inválido");\n}',
};

function sampleValue(arg) {
    const key = arg.replace(/=.*/, "").trim();
    if (SAMPLE_VALUES[key]) return SAMPLE_VALUES[key];
    if (/text|name|key|file|path/i.test(key)) return '"example"';
    if (/bool|enable|pause|quick|flee|auto/i.test(key)) return "true";
    if (/obj|inst/i.test(key))
        return `obj_${slugify(key).replaceAll("-", "_")}_example`;
    if (/x/i.test(key)) return "320";
    if (/y/i.test(key)) return "240";
    return "0";
}

function exampleFor(item, signature, returns) {
    if (EXAMPLE_OVERRIDES[item.name]) return EXAMPLE_OVERRIDES[item.name];
    const args = parseSignatureArgs(signature);
    const values = args.map(sampleValue);
    const callName = signature
        .replace(/^new\s+/, "")
        .slice(0, signature.indexOf("("));
    const local = operationName(item.name);
    let prefix = "";
    let call = `${callName}(${values.join(", ")})`;

    if (item.constructor) call = `new ${item.localName}(${values.join(", ")})`;
    else if (item.owner) {
        const receiver =
            item.owner === "Inventory"
                ? "Item_GetInventoryItems()"
                : item.owner === "ItemType" ||
                    item.owner === "ItemTypeSimple" ||
                    item.owner === "ItemTypeManager"
                  ? "Item_GetTypeManager()"
                  : `new ${item.owner}()`;
        prefix = `var target = ${receiver};\n`;
        call = `target.${item.localName}(${values.join(", ")})`;
    }

    const placeholderArgs = args.filter((arg) =>
        /obj_.*_example|info_key/.test(sampleValue(arg)),
    );
    const comment = placeholderArgs.length
        ? "// Substitua os nomes de exemplo pelos recursos do seu projeto.\n"
        : "";
    if (/^Is|^Contains/.test(local))
        return `${comment}${prefix}if (${call}) {\n    show_debug_message("Condição válida");\n}`;
    if (returns.type === "boolean")
        return `${comment}${prefix}var success = ${call};\nif (!success) {\n    show_debug_message("A operação foi recusada");\n}`;
    if (returns.type !== "undefined")
        return `${comment}${prefix}var result = ${call};\nshow_debug_message(result);`;
    return `${comment}${prefix}${call};`;
}

const seeds = extractApiSeeds();
const sourceFunctions = extractSourceFunctions();
const entries = sourceFunctions
    .map((item) => {
        const seed = seeds.get(item.name);
        const [category, subcategory] = categoryFor(item);
        const args = item.explicitArgs.length
            ? item.explicitArgs
            : item.documentedArgs;
        const sourceSignature = `${item.constructor ? "new " : ""}${item.name}(${args.join(", ")})`;
        const signature = item.owner
            ? sourceSignature
            : seed?.signature && !seed.signature.startsWith(".")
              ? seed.signature
              : sourceSignature;
        const description =
            DESCRIPTION_OVERRIDES[item.name] ||
            seed?.description ||
            fallbackDescription(item, category);
        const returns = returnInfo(item);
        const parameters = parseSignatureArgs(signature).map((raw) => {
            const [name, ...defaultParts] = raw.split("=");
            const defaultValue = defaultParts.length
                ? defaultParts.join("=").trim()
                : null;
            return {
                name: name.trim(),
                type: typeForArg(name),
                required: defaultValue === null,
                defaultValue,
                description:
                    item.owner === "Inventory" && name.trim() === "itemId"
                        ? "ID de um tipo de item previamente registrado no gerenciador deste inventário."
                        : descriptionForArg(name, category),
            };
        });

        return {
            slug: slugify(item.name.replaceAll(".", "-")),
            name: item.name,
            signature,
            kind: item.constructor
                ? "construtor"
                : item.owner
                  ? "método"
                  : "função",
            category,
            subcategory,
            summary: description,
            purpose: DOMAIN_PURPOSE[category] ?? DOMAIN_PURPOSE.Utilitários,
            whenToUse: useCaseFor(item, category),
            parameters,
            returns,
            sideEffects: effectsFor(item),
            notes: notesFor(item, signature, category),
            example: exampleFor(item, signature, returns),
            sourcePath: item.sourcePath,
            guideSlug: seed?.category?.toLowerCase().includes("item")
                ? "itens-e-inventarios"
                : category === "Padrões de bala" ||
                    category === "Inimigos" ||
                    category === "Encontros" ||
                    category === "Batalha"
                  ? "inimigos-e-batalhas"
                  : category === "Vida e dano" || category === "Jogador"
                    ? "sistemas-da-engine"
                    : category === "Diálogos e texto" ||
                        category === "Localização"
                      ? "dialogos-e-localizacao"
                      : category === "Saves e dados"
                        ? "sistemas-da-engine"
                        : "visao-geral",
        };
    })
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

const metadata = {
    generatedAt: new Date().toISOString(),
    engineVersion: "0.6.0",
    engineCommit: "f2567090eac73dd959d9ae05a1ad2ad9ff6b5385",
    sourceRepository: "https://github.com/TML233/UndertaleEngine",
    count: entries.length,
    entries,
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(metadata, null, 2)}\n`, "utf8");
console.log(
    `Geradas ${entries.length} entradas em ${path.relative(projectRoot, outputPath)}.`,
);
