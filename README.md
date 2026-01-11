# 🎤 Karaokê Patos vs Gatos 🐱🦆

Um karaokê feito em Angular para uso em família.

O sistema mede o **nível do microfone**, calcula uma **pontuação em tempo real** e transforma tudo em uma disputa entre **Gatos (vencedores 🐱)** e **Patos (perdedores 🦆)** — uma piada interna que virou identidade visual do projeto.

---

## ✨ Funcionalidades

- 🎬 **Carregamento de vídeos locais** (MP4)
- 🎤 **Captura de áudio via microfone** usando Web Audio API
- 📊 **Indicador visual de nível do microfone (RMS)** em tempo real
- 🧮 **Sistema de pontuação dinâmico**, baseado em:
  - Volume mínimo (silêncio)
  - Volume ideal
  - Penalização por clipping
- 🐱🦆 **Feedback visual** (gatos para pontuações altas, patos para baixas)
- 🏆 **Ranking persistente** (LocalStorage)
- 🎛️ **Painel de configuração avançada do microfone**

---

## 🖼️ Temática

O projeto foi pensado para ser:
- **Divertido para uso em família**
- **Visualmente leve e descontraído**
- **Apresentável como portfólio no GitHub**

### Conceito
- 🐱 **Gatos** → vencedores, boas performances
- 🦆 **Patos** → performances questionáveis (com muito carinho)

A ideia não é julgar talento musical — é gerar risadas.

---

## 🛠️ Tecnologias Utilizadas

- **Angular** (Standalone Components)
- **Angular Material** (UI)
- **TypeScript**
- **Vite / Angular SSR (dev)**
- **Electron** — empacotamento e execução desktop
- **Electron Builder** — geração do instalador/executável

---

## 🖥️ Aplicação Desktop com Electron

Este projeto utiliza Electron para empacotar a aplicação Angular como um aplicativo desktop multiplataforma.

O Electron permite que a aplicação seja executada como um programa nativo no sistema operacional, utilizando tecnologias web (HTML, CSS e TypeScript), sem depender de um navegador.

### 🔧 Principais usos do Electron neste projeto:

- Geração de executável (.exe) para Windows
- Execução local da aplicação Angular em ambiente desktop
- Acesso a recursos nativos do sistema operacional
- Distribuição do projeto como aplicação independente

## 🎤 Como funciona a pontuação

1. O microfone é ativado via `getUserMedia`
2. O áudio é analisado em tempo real usando `AnalyserNode`
3. São calculados:
   - **RMS (volume médio)**
   - **Peak (pico de volume)**
4. A cada frame:
   - Sons abaixo do `silenceRms` não pontuam
   - Sons na faixa ideal pontuam por segundo
   - Sons com clipping sofrem penalização

Tudo isso é ajustável no painel de configuração.

---

## ⚙️ Configurações disponíveis

- `silenceRms` — nível mínimo para considerar som
- `tooLoudRms` — limite ideal antes de penalizar
- `clipPeak` — pico máximo aceitável
- `maxPtsPerSec` — pontos máximos por segundo
- `clipPenaltyPerSec` — penalidade por clipping

As configurações são **salvas automaticamente no LocalStorage**.

---

## 🚀 Como rodar o projeto

```bash
# instalar dependências
npm install

# rodar em desenvolvimento
ng serve
```

Abra em: `http://localhost:4200`

⚠️ **Importante:** o navegador pedirá permissão para usar o microfone.

---

## 📁 Estrutura simplificada

```
src/
 ├── app/
    ├── karaoke/        # Componente principal
    ├── services/
    │   ├── audio.service.ts
    │   └── ranking.service.ts
    └── dialog-pontuacao/
```

---

## 🎯 Objetivo do projeto

- Praticar:
  - Web Audio API
  - ChangeDetectionStrategy.OnPush
  - Performance em loops com `requestAnimationFrame`
  - Angular Material
- Criar algo:
  - Útil
  - Divertido
  - Compartilhável

---

## 🧠 Aprendizados

- Integração de áudio em tempo real no Angular
- Uso correto de `NgZone` + `ChangeDetectorRef`
- Performance com `OnPush`
- UX baseada em feedback visual imediato

---

## 🐾 Considerações finais

Se você cantou mal e virou um pato 🦆 — tudo bem.

No **Karaokê Patos vs Gatos**, o importante é cantar.

---

👩‍💻 Projeto desenvolvido por **Natasha Mikaela**

📌 Projeto pessoal / portfólio

