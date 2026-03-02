# 🚀 Roadmap do Backend (Rumo à Produção)

Atualmente, o backend do Movout é um **MVP (Produto Mínimo Viável) Funcional**. Ele prova que a arquitetura funciona (Login, WebSockets, Criação de Frete), mas faltam regras de negócio complexas para competir com apps como Uber/99 Entregas.

Abaixo listo o que falta para chegar lá.

## 1. Inteligência de Match (Geolocalização) 🌍
**Atual:** O sistema escolhe o *primeiro* motorista disponível no banco, em qualquer lugar do mundo.
**Necessário:**
-   Usar **Redis GEO** ou **PostGIS** para buscar motoristas num raio de X km.
-   Persistir a última localização do motorista no Banco (não só no Redis).
-   Lógica de "Raio Incremental": Tenta buscar em 2km, se não achar, expande para 5km.

## 2. Precificação (Pricing) 💰
**Atual:** O frete é criado sem preço.
**Necessário:**
-   Calcular distância entre `Origem` e `Destino` (Google Maps API ou Haversine formula).
-   Fórmula de preço: `(Distância * PreçoKm) + (Tempo * PreçoMin) + TaxaFixa`.
-   Adicionar campos `preco_estimado` e `distancia_km` na tabela `PedidoFrete`.

## 3. Máquina de Estados (Fluxo da Corrida) 🔄
**Atual:** O status muda magicamente de "aberto" para "em andamento".
**Necessário:** Implementar o fluxo real de uma entrega:
1.  **Solicitado**: Aguardando motorista.
2.  **Oferecido**: Motorista visualizou (mas ainda não aceitou).
3.  **Aceito**: Motorista indo até a origem.
4.  **Em Coleta**: Motorista chegou na origem.
5.  **Em Trânsito**: Mercadoria coletada, indo ao destino.
6.  **Concluído**: Entregue.

*Novos Endpoints:* `/aceitar`, `/cheguei_coleta`, `/iniciar_viagem`, `/finalizar_viagem`.

## 4. Sistema de Oferta (Driver Acceptance) ✋
**Atual:** O servidor "escolhe" o motorista e atribui o frete à força.
**Necessário:**
-   O servidor deve enviar uma **Notificação** (via WebSocket/Push) para os motoristas próximos.
-   O motorista deve ter a opção de **Aceitar** ou **Rejeitar**.
-   Tratar concorrência (dois motoristas aceitando ao mesmo tempo).

## 5. Avaliação e Histórico ⭐
**Atual:** Não existe histórico visível.
**Necessário:**
-   Tabela `Avaliacao` (Nota 1-5, Comentário).
-   Endpoint para listar histórico de corridas do usuário e do motorista.

## 6. Notificações Push 📲
**Atual:** Apenas WebSockets (funciona bem com o app aberto).
**Necessário:** Integrar com **Firebase (FCM)** ou **Expo Notifications** para avisar o motorista mesmo com o celular bloqueado ("Nova corrida disponível!").

---

## 🎯 Recomendação de Prioridade

1.  **Geolocalização**: Sem isso, o app não funciona no mundo real.
2.  **Fluxo/Estados**: Para garantir que o motorista saiba o que fazer.
3.  **Precificação**: Para cobrar o valor justo.
