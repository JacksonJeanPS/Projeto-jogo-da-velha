# Jogo da Velha

Um jogo da velha interativo e responsivo desenvolvido com HTML5, CSS3 e JavaScript puro. O projeto oferece jogatina multiplayer local, modo contra computador com IA (algoritmo minimax), placar persistente, efeitos sonoros e navegação por teclado para acessibilidade.

## Funcionalidades

- **Modo Jogador vs Jogador (PvP)** — dois jogadores alternam as jogadas localmente
- **Modo Jogador vs Computador (PvC)** — IA imbatível usando o algoritmo minimax
- **Placar cumulativo** — vitórias de X, vitórias de O e empates salvos em `localStorage`
- **Detecção correta de vitória e empate** — todas as 8 combinações vencedoras são verificadas
- **Destaque visual da linha vencedora** — células vencedoras são destacadas em verde
- **Indicador de turno** — mostra claramente de quem é a vez (X ou O)
- **Bloqueio pós-fim de jogo** — impede jogadas após vitória ou empate
- **Botão de reiniciar** — reinicia o tabuleiro e o estado do jogo a qualquer momento
- **Efeitos sonoros** — cliques, vitória e empate com controle de mudo
- **Acessibilidade** — `aria-label` dinâmico em células, `aria-live` para anúncios de turno e resultado, navegação completa por teclado (setas para navegar, Enter/Space para marcar)
- **Responsividade** — layout adaptado para desktop, tablet e mobile

## Tecnologias

- **HTML5** — estrutura semântica com ARIA
- **CSS3** — Grid, Flexbox, variáveis, transições suaves, responsividade
- **JavaScript (ES6+)** — Web Audio API para efeitos sonivos, minimax para IA

## Como rodar localmente

1. Clone o repositório:
   ```bash
   git clone https://github.com/JacksonJeanPS/Projeto-jogo-da-velha.git
   ```

2. Acesse a pasta do projeto:
   ```bash
   cd Projeto-jogo-da-velha
   ```

3. Abra o arquivo `index.html` em seu navegador favorito:
   ```bash
   # No Windows:
   start index.html
   # No macOS:
   open index.html
   # No Linux:
   xdg-open index.html
   ```

Não é necessário instalar dependências ou configurar um servidor. O jogo roda diretamente no navegador.

## Controles

| Ação | Dispositivo |
|------|-------------|
| Marcar uma célula | Clique ou toque |
| Navegar entre células | Setas do teclado (com o tabuleiro em foco) |
| Marcar célula com teclado | Enter ou Space |
| Reiniciar partida | Botão "Reiniciar" |
| Limpar placar | Botão "Limpar placar" |
| Alternar modo | Botões "Jogador vs Jogador" / "Jogador vs Computador" |
| Ativar/desativar som | Botão de altíssomo no canto superior direito |

## Licença

Este projeto está licenciado sob a licença MIT.
