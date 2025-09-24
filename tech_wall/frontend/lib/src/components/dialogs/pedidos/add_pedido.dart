import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:tech_wall/src/api/materiais_estoque/materiais_estoque.dart';
import 'package:tech_wall/src/api/pedidos_compra/dto.dart';
import 'package:tech_wall/src/api/pedidos_compra/pedidos_compra.dart';
import 'package:tech_wall/src/components/app_button.dart';
import 'package:tech_wall/src/components/dialogs/interface.dart';
import 'package:tech_wall/src/constants/constants.dart';
import 'package:tech_wall/src/models/material_estoque.dart';
import 'package:tech_wall/src/utils/formatador_moeda.dart';

class AddPedidoDialog extends StatefulWidget implements DialogInterface {
  const AddPedidoDialog({super.key, this.initialMaterial});
  final MaterialEstoqueModel? initialMaterial;

  @override
  State<AddPedidoDialog> createState() => _AddPedidoDialogState();
}

class _AddPedidoDialogState extends State<AddPedidoDialog> {
  final _formKey = GlobalKey<FormState>();
  final _isPressed = ValueNotifier(false);
  final _qtdeController = TextEditingController();
  final _fornecedorController = TextEditingController();
  final _valorController = TextEditingController(text: '0,00');
  MaterialEstoqueModel? _selectedMaterial;

  @override
  void initState() {
    super.initState();
    _selectedMaterial = widget.initialMaterial;
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Criar Pedido de Compra'),
      content: Form(
        key: _formKey,
        child: SizedBox(
          width: 500,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            spacing: gaplg,
            children: [
              FutureBuilder<List<MaterialEstoqueModel>>(
                future: MateriaisEstoqueApi.listAll(),
                builder: (context, snapshot) {
                  if (!snapshot.hasData) {
                    return const Center(child: CircularProgressIndicator());
                  }

                  // Ordena a lista para mostrar os mais críticos primeiro
                  final materiais = snapshot.data!;
                  materiais.sort((a, b) {
                    final discrepanciaA = a.limBaixoEstoque - a.quantidade;
                    final discrepanciaB = b.limBaixoEstoque - b.quantidade;
                    return discrepanciaB.compareTo(
                      discrepanciaA,
                    ); // Ordem decrescente
                  });

                  return DropdownButtonFormField<MaterialEstoqueModel>(
                    initialValue: _selectedMaterial,
                    decoration: const InputDecoration(
                      labelText: 'Material',
                      filled: true,
                    ),
                    isExpanded: true,
                    items: materiais.map((material) {
                      final isLowStock =
                          material.quantidade < material.limBaixoEstoque;
                      final theme = Theme.of(context);

                      return DropdownMenuItem(
                        value: material,
                        child: Row(
                          children: [
                            Expanded(
                              child: Text(
                                material.item,
                                overflow: TextOverflow.ellipsis,
                                style: TextStyle(
                                  color: isLowStock
                                      ? theme.colorScheme.error
                                      : null,
                                ),
                              ),
                            ),
                            const SizedBox(width: gapmd),
                            Text(
                              '(Est: ${material.quantidade} / Mín: ${material.limBaixoEstoque})',
                              style: theme.textTheme.bodySmall?.copyWith(
                                color: isLowStock
                                    ? theme.colorScheme.error
                                    : theme.colorScheme.onSurfaceVariant,
                              ),
                            ),
                          ],
                        ),
                      );
                    }).toList(),
                    onChanged: (v) => setState(() => _selectedMaterial = v),
                    validator: (v) =>
                        v == null ? 'Selecione um material' : null,
                  );
                },
              ),
              TextFormField(
                controller: _qtdeController,
                decoration: const InputDecoration(
                  labelText: 'Quantidade Solicitada',
                  filled: true,
                ),
                keyboardType: TextInputType.number,
                inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                validator: (v) => (int.tryParse(v ?? '0') ?? 0) <= 0
                    ? 'Quantidade inválida'
                    : null,
              ),
              TextFormField(
                controller: _fornecedorController,
                decoration: const InputDecoration(
                  labelText: 'Fornecedor (Opcional)',
                  filled: true,
                ),
              ),
              TextFormField(
                controller: _valorController,
                decoration: const InputDecoration(
                  labelText: 'Valor Unitário (Opcional)',
                  filled: true,
                  prefixText: 'R\$ ',
                ),
                keyboardType: TextInputType.number,
                inputFormatters: [CurrencyInputFormatter()],
              ),
            ],
          ),
        ),
      ),
      actions: [
        AppButton.text(
          label: 'Cancelar',
          onPressed: () => Navigator.of(context).pop(),
        ),
        ValueListenableBuilder(
          valueListenable: _isPressed,
          builder: (context, pressed, _) => AppButton(
            isLoading: pressed,
            label: 'Criar Pedido',
            onPressed: _onPressedCriar,
          ),
        ),
      ],
    );
  }

  Future<void> _onPressedCriar() async {
    if (!_formKey.currentState!.validate()) return;
    if (_isPressed.value) return;
    _isPressed.value = true;

    final valor = double.tryParse(_valorController.text.replaceAll(',', '.'));
    final dto = CreatePedidoDto(
      materialId: _selectedMaterial!.id,
      qtSolicitada: int.parse(_qtdeController.text),
      fornecedor: _fornecedorController.text,
      valorUnitario: valor == 0 ? null : valor,
    );
    final success = await PedidosCompraApi.create(dto);

    _isPressed.value = false;
    if (success && mounted) Navigator.of(context).pop(true);
  }
}
