# Exibir apenas as provas do dia por padrão

## Objetivo

Ao abrir "Provas Agendadas", a lista deve mostrar somente as provas do dia atual (fuso America/Manaus), sem completar a página com registros antigos. Continua com 10 registros por página. Registros passados só aparecem quando o usuário usar os filtros.

## Mudanças

1. **Filtro de data padrão = hoje**
   - O estado inicial dos filtros passa a ter `examDate` com a data de hoje, em vez de vazio.
   - O resto da lógica de filtragem e ordenação permanece igual.

2. **Botão "Limpar" volta para hoje**
   - Limpa nome, módulo, PC, horário e estado, e redefine a data para o dia atual (padrão inicial).

3. **Remover o botão "Filtrar"**
   - A filtragem já é reativa (acontece ao digitar/selecionar), então o botão é removido e fica apenas "Limpar", centralizado.

4. **Mensagem quando não há provas no dia**
   - Quando o filtro está no dia atual e não há resultados, a tabela mostra "Nenhuma prova agendada para hoje" com a dica de usar os filtros para buscar outras datas.

## Detalhes técnicos

- `src/hooks/useExamFilters.ts`: estado inicial usa a data de hoje (mesma normalização já usada em `calendarDateToYmd`/`toManausDateStr`).
- `src/components/FilterBar.tsx`: remover o botão "Filtrar" e ajustar `clearFilters` para restaurar `examDate` como hoje.
- `src/components/ScheduleTable.tsx`: texto do estado vazio adaptado ao caso "hoje".
- Sem mudanças de banco, de rotas ou na paginação (segue em 10 por página).
