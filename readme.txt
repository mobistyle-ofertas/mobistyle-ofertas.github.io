# MobiStyle Ofertas - Guia de Operação e Conteúdo

Este arquivo contém as instruções necessárias para gerenciar o conteúdo do site MobiStyle Ofertas, incluindo a formatação de notícias e a atualização de dados.

---

## 1. Formatação de Notícias (Markdown)

O site utiliza o formato Markdown para permitir uma formatação rica nas notícias. Abaixo estão os comandos principais que você pode usar no campo "content" do arquivo `news.json`:

- **Títulos Internos:** Use `### Título` para criar subtítulos.
- **Negrito:** Use `**texto em negrito**`.
- **Itálico:** Use `*texto em itálico*`.
- **Listas com Marcadores:**
  * Item 1
  * Item 2
- **Links:** `[Texto do Link](https://www.exemplo.com)`
- **Citações:** `> "Esta é uma citação de destaque."`
- **Quebra de Parágrafo:** Pule uma linha entre os blocos de texto.

**Exemplo no JSON:**
"content": "### Lançamento 2024\n\nA nova moto é **incrível**. Confira os detalhes:\n\n* Motor potente\n* Design moderno\n\n[Saiba mais aqui](https://link.com)"

---

## 2. Estrutura de Dados (Arquivos JSON em /public)

O conteúdo do site é alimentado por quatro arquivos principais:

### base.json (Categorias e Modelos)
- **categories:** Define as abas principais (Motos, Equipamentos, Gadgets).
- **models:** Define os itens dentro de cada categoria.
  - *Dica:* Um modelo só aparece no menu se tiver ofertas vinculadas (afiliados ou usadas).

### news.json (Notícias)
- Contém a lista de todas as matérias do blog/feed.
- Cada notícia pode ter um `id` (que define a URL) e uma `image`.

### affiliates.json (Links de Compra)
- Onde você cadastra os links da Amazon, Mercado Livre, etc.
- O `id` do modelo no `base.json` deve ser a chave aqui.

### used_bikes.json (Motos Usadas)
- Onde você cadastra as ofertas de motos de segunda mão.
- O `id` do modelo de moto no `base.json` deve ser a chave aqui.

---

## 3. Como Adicionar Conteúdo

1. **Nova Notícia:** Adicione um novo objeto ao array em `news.json`. Se quiser que ela apareça na Home, adicione também ao array `homeNews` (se disponível no seu arquivo).
2. **Novo Modelo:** Adicione ao array `models` em `base.json`. Lembre-se de vincular ao `categoryId` correto.
3. **Novas Ofertas:** Adicione o link ou a oferta nos arquivos `affiliates.json` ou `used_bikes.json` usando o ID do modelo correspondente.

---

## 4. Imagens

- Todas as imagens devem ser salvas na pasta `/public/images/`.
- **Modelos:** `/public/images/models/id-do-modelo.jpg`
- **Notícias:** `/public/images/news/id-da-noticia.jpg`
- **Categorias:** `/public/images/categories/id-da-categoria.jpg`

---

## 5. Publicação (GitHub Pages)

O site está configurado para rodar de forma estática. Para publicar alterações:
1. Salve os arquivos JSON.
2. Faça o commit e push para o repositório no GitHub.
3. O deploy é automático via GitHub Actions ou pelo comando `npm run deploy` (se configurado localmente).

---

## 6. Comentários (IntenseDebate)

O site agora suporta comentários nas notícias através do IntenseDebate.
Para ativar, você precisa:
1. Criar uma conta em [intensedebate.com](https://www.intensedebate.com).
2. Obter o seu "Account ID".
3. Configurar a variável de ambiente `VITE_INTENSE_DEBATE_ACCT` no seu ambiente de deploy (GitHub Actions Secrets ou configurações do repositório).

*Se a variável não estiver configurada, uma mensagem de aviso aparecerá no local dos comentários.*

---

## 7. SEO e Sitemap

O site agora gera automaticamente um arquivo `sitemap.xml` durante o processo de build.
- O sitemap inclui links para todas as notícias, categorias e modelos de produtos.
- O arquivo `robots.txt` já está configurado para apontar para o sitemap em `https://mobistyle-ofertas.github.io/sitemap.xml`.
- Para atualizar o sitemap, basta realizar um novo deploy no GitHub.

---

*Guia gerado em: 06 de Abril de 2026*
