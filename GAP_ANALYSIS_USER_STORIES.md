# 📉 Análise de Gaps (Histórias de Usuário vs Atual)

Baseado nas histórias de usuário detalhadas, aqui está o que falta implementar no Backend para atender 100% dos requisitos.

## 1. Solicitação de Frete (Cliente)
| Requisito | Status Atual | O que falta implementar |
| :--- | :---: | :--- |
| **Foto do Item** | ❌ Inexistente | Adicionar campo `foto_url` em `PedidoFrete` e integaração com Storage (S3/Local). |
| **Medidas/Volume** | ❌ Inexistente | `PedidoFrete` só tem `peso_estimado`. Adicionar `altura`, `largura`, `profundidade` ou `volume_m3`. |
| **Agendamento** | ❌ Inexistente | Adicionar campo `data_agendada` (Datetime). Lógica para não buscar motorista imediatamente se for agendado. |
| **Endereço Completo** | ⚠️ Parcial | Falta estruturar: `origem_endereco`, `origem_lat`, `origem_lng`, `destino_endereco`, `destino_lat`, `destino_lng`. |

## 2. Match de Motoristas
| Requisito | Status Atual | O que falta implementar |
| :--- | :---: | :--- |
| **Filtro por Volume** | ❌ Inexistente | `Motorista` precisa de `capacidade_volume_m3` além de peso. O match deve validar `volume_frete <= capacidade_motorista`. |
| **Notificação Ativa** | ❌ Inexistente | O sistema "escolhe" um motorista. Precisa notificar todos os compatíveis num raio X e aguardar "Aceite". |
| **Ver Foto antes** | ❌ Inexistente | O payload da notificação deve incluir a foto e detalhes do frete. |

## 3. Negociação
| Requisito | Status Atual | O que falta implementar |
| :--- | :---: | :--- |
| **Contraproposta** | ❌ Inexistente | Criar tabela `Negociacao` ou `PropostaFrete` (FreteID, MotoristaID, Valor, Status). |
| **Chat/Acordo** | ❌ Inexistente | WebSocket de chat entre Cliente/Motorista específico para aquele frete. |

## 4. Execução e Pagamento
| Requisito | Status Atual | O que falta implementar |
| :--- | :---: | :--- |
| **Confirmação Carga** | ❌ Inexistente | Endpoint `PATCH /fretes/{id}/coletado`. |
| **Pagamento 50%** | ❌ Inexistente | Integração com Gateway (Stripe/Asaas/MercadoPago) para capturar/liberar fundos. |
| **Código Confirmação** | ❌ Inexistente | Gerar OTP aleatório (ex: 1234) na criação do frete. Endpoint para driver validar o código na entrega. |

## 5. Motorista
| Requisito | Status Atual | O que falta implementar |
| :--- | :---: | :--- |
| **Status Ativo/Inativo** | ⚠️ Básico | Existe `disponivel`, mas a lógica de não receber notificações precisa ser refinada no filtro do Match. |

---

## 🛠️ Resumo Técnico das Mudanças Necessárias

1.  **Banco de Dados (`models.py`)**:
    -   Alterar `PedidoFrete`: Adicionar `volume`, `dimensoes`, `foto`, `data_agendada`, `codigo_confirmacao`.
    -   Alterar `Motorista`: Adicionar `capacidade_volume`.
    -   Criar `Proposta`: Para negociação de valor.
2.  **Lógica (`fretes.py`)**:
    -   Alterar algoritmo de Match para considerar Volume + Raio de Distância.
    -   Mudar fluxo: Em vez de atribuir direto, criar "Ofertas" e notificar via WebSocket.
3.  **Fluxo de Status**:
    -   Implementar máquina de estados: `Aberto -> Negociacao -> Aceito -> Coleta -> Viagem -> Entrega -> Finalizado`.
