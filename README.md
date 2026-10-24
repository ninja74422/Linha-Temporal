# Linha do tempo de anotações

App de anotações em que cada nota fica registrada numa linha do tempo, com data e hora automáticas.
Feito com HTML, CSS e JavaScript puros, sem dependências nem etapa de build.

## Funcionalidades

- Anotações salvas com horário, dia, mês e ano
- Filtro por ano, mês e dia (as opções mostram só períodos que têm anotações)
- Celular: lista vertical com a linha do tempo à direita
- Computador: linha do tempo horizontal no meio, com as anotações alternando acima e abaixo
- Dados salvos no navegador (`localStorage`)
- Efeitos visuais: rede de partículas que reage ao mouse, fundo em aurora com parallax, brilho que segue o cursor, spotlight nos cards e animação de entrada nas novas notas (respeita `prefers-reduced-motion`)
- Tema claro e escuro automático, navegação por teclado (`Ctrl + Enter` salva a nota)

## Como rodar

Abra o `index.html` no navegador.

## Publicar no GitHub Pages

1. Suba os arquivos para um repositório.
2. Em **Settings → Pages**, escolha a branch `main` e a pasta `/ (root)`.
3. O site fica disponível em `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/`.

## Estrutura

```
index.html   estrutura da página
style.css    layout responsivo (vertical no celular, horizontal no PC) e temas
app.js       dados, filtros em cascata e renderização
effects.js   fundo em canvas e efeitos de mouse
```

## Ideias para evoluir

- Editar anotações
- Buscar por texto
- Exportar e importar em JSON
