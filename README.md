# @luanky/network-inspector

Inspetor e monitor visual de requisições HTTP universal para **React Native**, **React**, **Angular**, **Vue** e **Desktop**.

---

## 🚀 Instalação

```bash
npm install @luanky/network-inspector
```

Ou diretamente a partir de um repositório Git ou pasta local:

```bash
# Via Git
npm install git+https://github.com/seu-usuario/network-inspector.git

# Via pasta local (para testes)
npm install ./caminho/para/packages/network-inspector
```

---

## 📱 Uso em React Native / Expo

No ponto de entrada da sua aplicação (ex: `App.tsx` ou layout raiz):

```tsx
import React from 'react';
import { View } from 'react-native';
import { NetworkInspector } from '@luanky/network-inspector/react-native';

export default function App() {
  return (
    <View style={{ flex: 1 }}>
      {/* Suas rotas e telas */}
      <NetworkInspector />
    </View>
  );
}
```

---

## 💻 Uso em Web (React, Next.js, Vite)

No arquivo de inicialização (`index.tsx`, `main.tsx` ou `_app.tsx`):

```ts
import { initWebNetworkInspector } from '@luanky/network-inspector';

initWebNetworkInspector();
```

---

## 🅰️ Uso em Angular

No arquivo `src/main.ts`:

```ts
import { initWebNetworkInspector } from '@luanky/network-inspector';

initWebNetworkInspector();
```

---

## 🟢 Uso em Vue.js

No arquivo `src/main.ts` ou `src/main.js`:

```ts
import { initWebNetworkInspector } from '@luanky/network-inspector';

initWebNetworkInspector();
```

---

## 🖥️ Uso em Desktop (Electron) ou Vanilla JS

No script principal do renderer (`index.html` ou renderer script):

```html
<script type="module">
  import { initWebNetworkInspector } from './path/to/network-inspector.js';
  initWebNetworkInspector();
</script>
```

---

## ⚙️ Apenas Interceptação (Headless / Core)

Se você desejar apenas capturar os logs sem renderizar nenhuma interface gráfica (ex: para testes, envio a servidores de telemetria ou integração customizada):

```ts
import { initNetworkLogging, subscribeNetworkLogs, getNetworkLogs } from '@luanky/network-inspector/core';

initNetworkLogging();

subscribeNetworkLogs(() => {
  const logs = getNetworkLogs();
  console.log("Últimas requisições:", logs);
});
```