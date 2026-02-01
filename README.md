# IQ Signals - Site de Sinais para IQ Options

Este é um site que fornece sinais de trading para a IQ Options, com um sistema de monetização baseado em propagandas.

## Funcionalidades

- Sistema de ciclo: 2 sinais grátis, 1 sinal com propaganda obrigatória
- Sinais gerados automaticamente a cada 2 minutos
- Histórico de sinais com armazenamento local
- Estatísticas em tempo real
- Modal de propaganda com temporizador
- Totalmente responsivo

## Como Executar

1. **Abra o VS Code**
2. **Crie uma nova pasta** para o projeto
3. **Crie os arquivos** conforme a estrutura acima
4. **Abra o arquivo `index.html`** no navegador

Ou, alternativamente:

1. **Salve todos os arquivos** na mesma pasta
2. **Dê duplo clique** no arquivo `index.html`

## Personalização

### Para Adicionar Anúncios Reais:

1. **Google AdSense**:
   - Substitua o conteúdo dentro de `adContent` no `index.html`
   - Adicione seu código do AdSense no modal

2. **Outras Redes de Anúncios**:
   - Adicione os scripts no `<head>` do `index.html`
   - Configure os espaços para anúncios

### Para Modificar o Sistema de Sinais:

- Altere `freeSignalsPerCycle` e `adSignalsPerCycle` no `script.js`
- Modifique o intervalo de tempo em `signalInterval`
- Adicione mais ativos no array `assets`

## Tecnologias Utilizadas

- HTML5
- CSS3 (com variáveis CSS e Grid/Flexbox)
- JavaScript (ES6+)
- LocalStorage para persistência de dados

## Licença

Este projeto é para fins educacionais. Use por sua conta e risco.

## Aviso Legal

Este site é apenas para fins educacionais. Não garantimos lucros em operações de trading. Trading envolve riscos significativos.