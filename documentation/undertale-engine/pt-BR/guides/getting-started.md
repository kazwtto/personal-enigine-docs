<!-- locale: pt-BR; content-id: getting-started -->

# Primeiros passos

## Pré-requisitos

- GameMaker com suporte ao formato atual do projeto;
- noções de sprites, objetos, eventos, salas e GML;
- Git/GitHub Desktop recomendado para receber atualizações sem perder mudanças.

> [!WARNING]
> As branches `old_version` e `old_version_examples` foram arquivadas e só
> funcionam corretamente em versões do GameMaker anteriores à atualização 2.3.
> Para um projeto novo, use a branch `master`.

## Obter e abrir o projeto

1. Abra o [repositório oficial](https://github.com/TML233/UndertaleEngine).
2. Faça um **fork** para sua conta se quiser acompanhar atualizações.
3. Clone o fork.
4. Crie uma branch para seu jogo, por exemplo `meu-jogo`.
5. Abra `undertale_engine.yyp` no GameMaker.
6. Execute o projeto original uma vez antes de modificar qualquer coisa.

Se preferir baixar ZIP, ele funciona, mas atualizar e comparar suas mudanças
fica mais difícil.

## Configuração mínima do jogo

Abra `Macro_Game` e altere:

```gml
#macro GAME_NAME "Meu Fangame"
#macro GAME_AUTHOR "Meu Nome"
#macro GAME_VERSION "v0.1.0"
#macro GAME_SAVE_NAME "meu_fangame"
```

`GAME_SAVE_NAME` só deve ter letras, números e `_`. Ele define a pasta dos
arquivos JSON. Trocar esse valor depois de publicar faz o jogo procurar saves
em outra pasta.

No GameMaker, ajuste também as opções de plataforma, nome do executável, ícone,
informações de versão e resolução conforme seu alvo.

## Conheça as salas padrão

| Sala | Papel |
|---|---|
| `room_init` | primeira sala; contém o `world` persistente |
| `room_logo` | logo/abertura |
| `room_menu` | título, nome e carregamento |
| `room_area_0` | área de demonstração do overworld |
| `room_battle` | controlador universal de batalhas |
| `room_gameover` | sequência de derrota |
| `room_shop` | reservada para loja; a base atual não traz um sistema completo |
| `room_settings` | reservada para ajustes |

Mantenha `room_init` como a primeira sala. Não duplique `world`, `camera`,
`fader` ou `border` manualmente em cada sala: `world` cria os controladores e
permanece vivo.

## Controles padrão

| Ação | Teclas |
|---|---|
| confirmar | `Enter` ou `Z` |
| cancelar/correr devagar na batalha | `Shift` ou `X` |
| menu | `Ctrl` ou `C` |
| mover | setas |
| tela cheia | `F4` |
| reiniciar durante desenvolvimento | `F2` |

Os binds ficam no evento **Game Start** de `world`. Use a API `Input_*` para
adicionar teclado, gamepad ou mouse; veja
[Sistemas da engine](/guides/engine-systems#entrada).

## Seu primeiro mapa jogável

1. Duplique `room_area_0` ou crie uma sala de overworld.
2. Adicione uma camada de instâncias para colisão e outra para personagens.
3. Coloque `char_player`.
4. Desenhe paredes com instâncias de `block` ou objetos filhos de `block`.
5. Coloque um `char_sign` e, no **Creation Code** da instância, defina:

```gml
text = "* Olá!&* Esta é minha primeira sala.";
```

6. Execute, aproxime-se da placa e confirme.

`&` cria uma nova linha. O `char_player` procura uma instância de `char` na
frente dele e chama o **User Event 0 (Interact)** desse objeto.

## Dados iniciais do jogador

Edite `Player_CustomInitialData` para um jogo novo:

```gml
function Player_CustomInitialData() {
    Player_SetName("PLAYER");
    Player_SetLv(1);
    Player_SetHpMax(20);
    Player_SetHp(20);
    Player_SetAtk(10);
    Player_SetDef(10);
    Player_SetSpd(2);
    Player_SetInv(40);
    Player_SetBattleFightMenuObj(battle_menu_fight_knife);

    var items = Item_GetInventoryItems();
    // Adicione aqui somente IDs já registrados em Item_Custom.

    Player_SetItemWeapon(ITEM_EMPTY);
    Player_SetItemArmor(ITEM_EMPTY);
}
```

Esse script é chamado durante a criação das áreas de armazenamento. Ele também
serve como padrão após limpar dados. Não use essa função para conceder um item
toda vez que uma sala começa.

## Fluxo seguro de atualização

1. Faça commit das suas mudanças na branch do jogo.
2. Atualize a branch `master` do seu fork a partir do repositório oficial.
3. Mescle `master` na branch do jogo.
4. Resolva conflitos preservando seus registros em `Item_Custom`,
   `Encounter_Custom`, `Macro_*`, `Storage_Custom_*` e recursos próprios.
5. Abra o projeto e teste jogo novo, load, troca de sala e batalha.

Evite renomear o arquivo `.yyp` se pretende continuar mesclando atualizações;
isso cria conflitos desnecessários.

## Checklist antes de criar conteúdo

- [ ] Projeto original executa sem erro.
- [ ] Nome, autor, versão e pasta de save foram alterados.
- [ ] O jogo está em uma branch própria.
- [ ] `room_init` continua em primeiro lugar.
- [ ] Um `char_sign` mostra diálogo.
- [ ] O jogador colide com `block`.
- [ ] Você sabe onde ficam `Item_Custom`, `Encounter_Custom` e
      `Player_CustomInitialData`.

Próximo: [Overworld e NPCs](/guides/overworld-rooms-and-npcs).
