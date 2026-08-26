# Tornar filtro de data opcional com limpar individual

## Problema

Atualmente o dashboard abre com a data de hoje preenchida por padrão. Isso impede buscas amplas — por exemplo, ao digitar o nome de um aluno para ver todas as provas que ele fez ao longo dos meses, nenhum resultado aparece porque o filtro de data ainda restringe a "hoje".

## Solução

O campo de data continua preenchido com "hoje" ao abrir a página, mas o usuário poderá limpar **apenas** a data. Com a data vazia, os filtros de nome, módulo, PC, horário e status passam a buscar em todo o histórico de provas. O botão geral "Limpar" continua resetando tudo e voltando a data para hoje.

## Mudanças

### 1. `src/hooks/useExamFilters.ts`

- Estado inicial mantém `examDate` como `getTodayInManaus()`.
- Permite `examDate: null`.
- No `useEffect` de filtragem, aplica o filtro de data somente quando `examDate` não for `null`.
- Ordenação continua colocando provas de hoje primeiro, depois cronológico.

### 2. `src/components/FilterBar.tsx`

- Adicionar botão/ícone `X` dentro do campo de data para limpar **somente** a data, definindo `examDate: null`.
- Quando a data estiver `null`, exibir o placeholder "Selecione a data" no botão do calendário.
- Botão "Limpar" geral continua resetando todos os filtros e voltando a data para hoje.

### 3. `src/pages/Index.tsx`

- Ajustar a lógica `isTodayFilter` para considerar que a data pode estar `null`.
- Se a data estiver vazia e não houver resultados, mostrar mensagem genérica ("Nenhuma prova encontrada") em vez da mensagem específica de "hoje".
- Se a data for hoje e não houver resultados, manter a mensagem "Nenhuma prova agendada para hoje".

## Fora do escopo

- Sem mudanças no backend, tabelas ou RLS.
- Sem alteração na quantidade de registros por página (continua 10).
- Sem alteração no botão "Limpar" geral.
