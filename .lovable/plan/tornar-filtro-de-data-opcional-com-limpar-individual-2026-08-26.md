# Tornar filtro de data opcional com limpar individual

## Problema

Atualmente o dashboard abre com a data de hoje preenchida por padrão. Isso impede buscas amplas — por exemplo, ao digitar o nome de um aluno para visualizar todas as provas dele ao longo dos meses, os resultados continuam restritos à data atual.

## Solução

O campo de data continua preenchido com a data de hoje ao abrir a página, mantendo o comportamento padrão de exibir apenas as provas do dia atual.

O usuário poderá, porém, limpar apenas o filtro de data. Com a data vazia, os filtros de nome, módulo, PC, horário e status passam a pesquisar em todo o histórico de provas.

O botão geral **"Limpar"** continua resetando todos os filtros e restaurando a data para hoje.

## Mudanças

### 1. `src/hooks/useExamFilters.ts`

- O estado inicial mantém `examDate` como `getTodayInManaus()`.
- O filtro de data passa a permitir um estado vazio:
  - Preferencialmente `null`, caso isso se integre bem com a tipagem atual.
  - Caso `examDate` já seja tratado como `string` em vários pontos do sistema, pode ser utilizado `""` para evitar alterações desnecessárias.
- No `useEffect` responsável pela filtragem, aplicar o filtro de data apenas quando existir uma data selecionada.
- Quando a data estiver vazia, os demais filtros devem pesquisar em todo o histórico.
- Quando a consulta abranger várias datas, ordenar os registros do mais recente para o mais antigo.
- Manter a lógica atual de normalização de datas considerando o fuso `America/Manaus`.

### 2. `src/components/FilterBar.tsx`

- Adicionar um botão/ícone **X** no campo de data para limpar somente esse filtro.
- Ao clicar no X:
  - definir `examDate` como `null` ou `""`, conforme a abordagem escolhida;
  - manter os demais filtros inalterados.
- Quando não houver data selecionada, exibir o placeholder:
  **"Selecione a data"**
- O botão geral **"Limpar"** continua:
  - limpando nome;
  - módulo;
  - PC;
  - horário;
  - status;
  - restaurando `examDate` para `getTodayInManaus()`.

### 3. `src/pages/Index.tsx`

- Ajustar a lógica de `isTodayFilter` para considerar que `examDate` pode estar vazia.
- Se a data estiver vazia e nenhum registro for encontrado, exibir:
  **"Nenhuma prova encontrada."**
- Se a data selecionada for hoje e não houver resultados, manter:
  **"Nenhuma prova agendada para hoje."**
- Se uma data diferente de hoje estiver selecionada e não houver resultados, utilizar uma mensagem compatível com a busca realizada, por exemplo:
  **"Nenhuma prova encontrada para a data selecionada."**

### 4. Reset da paginação ao alterar filtros

- Sempre que qualquer filtro for alterado, a paginação deve voltar automaticamente para a página 1.
- Isso evita situações em que o usuário esteja, por exemplo, na página 4 e faça uma nova pesquisa que possua apenas uma página de resultados.
- A regra deve valer para:
  - nome;
  - módulo;
  - PC;
  - data;
  - horário;
  - status;
  - limpeza individual da data;
  - botão geral "Limpar".

## Comportamento esperado

### Ao abrir a página

- `examDate` recebe a data atual em `America/Manaus`.
- O sistema exibe somente as provas de hoje.
- Continua mostrando no máximo 10 registros por página.
- Se houver apenas 4 provas hoje, são exibidas somente essas 4.
- Registros antigos não são usados para completar a página.

### Ao selecionar outra data

- O sistema exibe somente as provas daquela data.
- Os demais filtros continuam funcionando em conjunto com a data selecionada.

### Ao limpar apenas a data

- O campo fica sem uma data selecionada.
- Os demais filtros passam a buscar em todo o histórico.
- Exemplo:
  `Nome = João` + `Data vazia` → mostra todas as provas de João, independentemente da data.

### Ao pesquisar no histórico

- Quando houver resultados de várias datas, os registros devem ser exibidos do mais recente para o mais antigo.

### Ao clicar em "Limpar"

- Todos os filtros são resetados.
- A data volta automaticamente para hoje.
- A paginação volta para a página 1.
- A tela volta a mostrar apenas as provas do dia atual.

## Fora do escopo

- Sem mudanças no backend.
- Sem mudanças nas tabelas do banco.
- Sem mudanças nas políticas RLS.
- Sem mudanças nas rotas.
- Sem alteração na quantidade de registros por página: continua em 10.
- Sem retorno do botão "Filtrar"; a filtragem continua sendo reativa.
- Sem alteração automática ou silenciosa do filtro de data ao digitar nome, módulo ou PC.