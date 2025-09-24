import 'package:flutter/material.dart';
import 'package:tech_wall/src/api/vendas/vendas.dart';
import 'package:tech_wall/src/components/dialogs/interface.dart';
import 'package:tech_wall/src/models/venda.dart';
import 'package:tech_wall/src/models/venda_item_override.dart';

class ViewVendaDetailsDialog extends StatefulWidget implements DialogInterface {
  final VendaModel venda;

  const ViewVendaDetailsDialog({super.key, required this.venda});

  @override
  State<ViewVendaDetailsDialog> createState() => _ViewVendaDetailsDialogState();
}

class _ViewVendaDetailsDialogState extends State<ViewVendaDetailsDialog> {
  late Future<List<VendaItemOverride>> _customizationFuture;

  @override
  void initState() {
    super.initState();
    _customizationFuture = VendasApi.getCustomization(widget.venda.id);
  }

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return AlertDialog(
      title: Text('Detalhes da Venda #${widget.venda.id}'),
      content: SizedBox(
        width: 600,
        child: FutureBuilder<List<VendaItemOverride>>(
          future: _customizationFuture,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const Center(child: CircularProgressIndicator());
            }

            final customItems = snapshot.data ?? [];
            final isCustomized = customItems.isNotEmpty;

            final originalMaterials = widget.venda.modelo?.materiais ?? [];

            return SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildDetailRow(
                    'Cliente:',
                    widget.venda.cliente?.nome ?? 'N/A',
                  ),
                  _buildDetailRow(
                    'Modelo:',
                    widget.venda.modelo?.nome ?? 'N/A',
                  ),
                  _buildDetailRow(
                    'Preço:',
                    'R\$ ${widget.venda.preco.toStringAsFixed(2)}',
                  ),
                  _buildDetailRow(
                    'Status:',
                    widget.venda.statusVenda.description,
                  ),
                  const Divider(height: 30),
                  Text(
                    'Materiais',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  if (isCustomized)
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 8.0),
                      child: Text(
                        'Este modelo foi customizado.',
                        style: TextStyle(color: scheme.primary),
                      ),
                    ),
                  if (isCustomized)
                    ...customItems.map((item) {
                      final index = originalMaterials.indexWhere(
                        (m) => m.material.id == item.material.id,
                      );
                      final originalQty = index >= 0
                          ? originalMaterials[index].qtModelo
                          : null;
                      final isModified =
                          originalQty == null || originalQty != item.qtFinal;
                      return ListTile(
                        title: Text(item.material.item),
                        trailing: Text('x${item.qtFinal}'),
                        tileColor: isModified
                            ? scheme.tertiaryContainer.withAlpha(
                                (255 * 0.5).round(),
                              )
                            : null,
                      );
                    })
                  else
                    ...originalMaterials.map(
                      (item) => ListTile(
                        title: Text(
                          item.material.id,
                        ), // This should be the material name
                        trailing: Text('x${item.qtModelo}'),
                      ),
                    ),
                ],
              ),
            );
          },
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('Fechar'),
        ),
      ],
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        children: [
          Text(label, style: const TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(width: 8),
          Expanded(child: Text(value)),
        ],
      ),
    );
  }
}
