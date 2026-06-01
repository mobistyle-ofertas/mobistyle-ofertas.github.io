# Sugestões de Melhorias Futuras

Este documento contém uma lista de melhorias arquiteturais e de código para o projeto, visando escalabilidade, manutenibilidade, performance e clareza. São refatorações técnicas que não alteram a usabilidade ou aparência, mas garantem a saúde do projeto a longo prazo.

## 1. Componentização e Separação de Arquivos (Refatoração do `App.tsx`)
Atualmente o arquivo `src/App.tsx` possui mais de 3000 linhas, concentrando rotas, páginas, componentes e lógicas. Dividir o código facilita a manutenção em equipe e a legibilidade.

**Passo a passo:**
1. Criar diretórios separados: `src/components/` e `src/pages/`.
2. Mover componentes de interface genéricos e repetitivos (ex: `Navbar`, `Footer`, `ShareButtons`, `SearchableModelSelect`, `CompareModels`) para arquivos próprios dentro de `src/components/`, exportando-os.
3. Mover componentes que representam layouts ou rotas inteiras (ex: `Home`, `CategoryPage`, `ModelPage`, `NewsDetail`) para `src/pages/`.
4. No arquivo `App.tsx`, importar estes módulos e focar apenas na declaração do `Router` (`Routes`, `Route`) e providers globais.

## 2. Refatoração e Isolamento da Tipagem (TypeScript)
As definições de interfaces e tipos estão misturadas no meio do código dos componentes ou no topo do arquivo principal.

**Passo a passo:**
1. Criar um arquivo global de tipos, como `src/types/index.ts`.
2. Recortar todas as declarações de `interface` (ex: `SiteData`, `Model`, `NewsItem`, ofertas) do `App.tsx` para lá.
3. Exportar cada uma das interfaces (`export interface ...`).
4. Importar esses tipos apenas onde forem necessários: `import type { SiteData, Model } from '../types'`.

## 3. Gerenciamento de Estado Global (Evitar Prop Drilling)
Atualmente o objeto `data` (com todo o `base.json`) é passado para quase todos os componentes através de props (`<ModelPage data={data} />`).

**Passo a passo:**
1. Configurar a **Context API** do React (ex: `src/context/SiteDataContext.tsx`).
2. Criar um `SiteDataProvider` que realiza o carregamento do `base.json` e armazena no seu state.
3. Enrolar a árvore principal do app com este Provider.
4. Criar um custom hook `useSiteData()`.
5. Remover todas as props `data={data}` passadas manualmente. Nos componentes filhos, basta chamar `const data = useSiteData()`.

## 4. Otimização de Performance e Code-Splitting (Lazy Loading)
Toda a aplicação atual é compilada em um único pacote (bundle). Páginas que o usuário não está visitando (como categorias não acessadas) são baixadas inicialmente.

**Passo a passo:**
1. No `App.tsx`, ao invés de importação estática normal de páginas, utilizar o método de carregamento sob demanda do React: `const ModelPage = React.lazy(() => import('./pages/ModelPage'))`.
2. Envolver a seção do `Routes` do React Router em um componente `<React.Suspense fallback={<Loading />}>`.
3. Isso irá forçar o empacotador (Vite/Webpack) a separar o código por rota, otimizando o carregamento inicial da Home.

## 5. Criação de um Componente SEO Centralizado
Existem muitos blocos de tags `<Helmet>` idênticos sendo repetidos nas páginas `Home`, `CategoryPage`, `ModelPage` e `NewsDetail`.

**Passo a passo:**
1. Criar um `src/components/SEO.tsx`.
2. Passar propriedades relevantes (props: `title`, `description`, `image`, `url`, `type`).
3. O componente irá renderizar dinamicamente o `<Helmet>` contendo as tags Meta, Open Graph (Facebook/WhatsApp) e Twitter.
4. Substituir as invocações atuais espalhadas pelo código por simples elementos como: `<SEO title="Título" description="Resumo" />`.

## 6. Criação de Hook Customizado para Carregamento (Data Fetching)
O carregamento primário (o fetch de `base.json`) e do estado de loading ocupam considerável lógica do inicio do app.

**Passo a passo:**
1. Extrair isso para `src/hooks/useFetchSiteData.ts`.
2. Dentro do hook, manter `useState` para os dados, loading e tracking de erros; e o `useEffect` que executa efetivamente a chamada para `/base.json`.
3. Retornar um objeto ou array: `return { data, loading, error };`.

## 7. Implementação de React Error Boundaries
Atualmente, se ocorrer um erro em um componente durante a renderização (ex: dado mal formatado no base.json), a tela inteira fica em branco.

**Passo a passo:**
1. Adicionar e utilizar a biblioteca `react-error-boundary` (ou classe nativa de Error Boundary).
2. Envolver componentes de seções específicas ou páginas em um `<ErrorBoundary fallback={<ErrorDisplay />}>`.
3. Exibir uma UI amigável em caso de erro, oferecendo ao usuário um botão para recarregar a página sem quebrar todo o Front-End da aplicação.

## 8. Acessibilidade (A11y) e Reset de Foco de Rota
Sendo um SPA (React Router), ao mudar de página, o foco não retorna ao topo para leitores de tela e muitas imagens podem estar sem atributos apropriados.

**Passo a passo:**
1. Criar um componente utilitário `ScrollToTop` ou hook global baseando no evento da mudança de localidade do Router, que manipula o `window.scrollTo(0,0)` e devolve o foco para a tag `<h1>` principal.
2. Revisar todas as tags `<img>` e botões soltos (como barras de menu) para assegurar o uso adequado das tags `aria-label` e `alt` consistentes.

## 9. Otimização Avançada de Imagens e Recursos
O uso apenas de `<img>` não garante otimização de imagens, impactando o Web Vitals LCP (Largest Contentful Paint).

**Passo a passo:**
1. Aplicar sistematicamente as tags `loading="lazy"` e `decoding="async"` nas imagens que ficam abaixo da dobra (off-screen).
2. Transição estrutural visando imagens em novos formatos (WebP/AVIF) preferencialmente utilizando a tag `<picture>` (HTML Nativo) combinada com fallback.

## 10. Reintrodução do Botão "Seguir/Favoritar no Google Notícias"
O botão "Seguir no Google Notícias" foi removido temporariamente do topo da Home Page e do rodapé da página de detalhes da notícia (News Detail) para não chamar atenção enquanto o site ainda não foi indexado nas fontes preferidas.

**Passo a passo:**
1. Monitorar a indexação do site no Google Notícias.
2. Quando o site for validado e estiver com tráfego relevante no formato, reintroduzir o botão `<a href={data.socialLinks.googleNews} ...>` no componente `Home` ao lado do título "Últimas Notícias".
3. Reintroduzir o bloco "Não perca nada! Favorite o MobiStyle Ofertas..." com o respectivo botão abaixo do conteúdo da notícia no componente `NewsDetail`.

---
**Observação Estratégica:**
Na implementação futura destas sugestões, recomenda-se que as modificações sejam realizadas progressivamente (um passo por vez) compilando o site para garantir que as rotas antigas permaneçam intactas antes de partir para a próxima dica.
