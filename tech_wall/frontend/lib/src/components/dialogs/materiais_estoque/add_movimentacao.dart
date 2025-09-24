import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:tech_wall/src/api/materiais_estoque/materiais_estoque.dart';
import 'package:tech_wall/src/api/movimentacoes_materiais/dto.dart';
import 'package:tech_wall/src/api/movimentacoes_materiais/movimentacoes_materiais.dart';
import 'package:tech_wall/src/components/app_button.dart';
import 'package:tech_wall/src/components/dialogs/interface.dart';
import 'package:tech_wall/src/constants/constants.dart' show gaplg;
import 'package:tech_wall/src/models/material_estoque.dart';
import 'package:tech_wall/src/utils/hint_style.dart';

class AddMovimentacaoDialog extends StatefulWidget implements DialogInterface {
  const AddMovimentacaoDialog({super.key});

  @override
  State<AddMovimentacaoDialog> createState() => _AddMovimentacaoDialogState();
}

class _AddMovimentacaoDialogState extends State<AddMovimentacaoDialog> {
  static const double _maxWidth = 500;
  final _formKey = GlobalKey<FormState>();
  final _isPressed = ValueNotifier(false);
  final _tipoMovimentacao = ValueNotifier<TipoMovimentacao>(
    TipoMovimentacao.entrada,
  );
  final _selectedMaterial = ValueNotifier<MaterialEstoqueModel?>(null);

  final _qtdeController = TextEditingController();
  final _fornecedorController = TextEditingController();
  final _notasController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      scrollable: true,
      title: const Text('Registrar Movimentação de Estoque'),
      content: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: _maxWidth),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            spacing: gaplg,
            children: [
              FutureBuilder<List<MaterialEstoqueModel>>(
                future: MateriaisEstoqueApi.listAll(),
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const Center(child: CircularProgressIndicator());
                  }
                  if (snapshot.hasError ||
                      !snapshot.hasData ||
                      snapshot.data!.isEmpty) {
                    return const Text(
                      'Não foi possível carregar os materiais.',
                    );
                  }
                  final materiais = snapshot.data!;
                  return ValueListenableBuilder(
                    valueListenable: _selectedMaterial,
                    builder: (context, material, _) {
                      return DropdownButtonFormField<MaterialEstoqueModel>(
                        initialValue: material,
                        decoration: InputDecoration(
                          filled: true,
                          labelText: 'Material',
                          hintStyle: hintStyle(context),
                        ),
                        items: materiais.map((m) {
                          return DropdownMenuItem(
                            value: m,
                            child: Text(m.item),
                          );
                        }).toList(),
                        onChanged: (value) => _selectedMaterial.value = value,
                        validator: (v) =>
                            v == null ? 'Selecione um material' : null,
                      );
                    },
                  );
                },
              ),
              ValueListenableBuilder(
                valueListenable: _tipoMovimentacao,
                builder: (context, tipo, _) {
                  return SegmentedButton<TipoMovimentacao>(
                    segments: const [
                      ButtonSegment(
                        value: TipoMovimentacao.entrada,
                        label: Text('Entrada'),
                        icon: Icon(Icons.arrow_downward),
                      ),
                      ButtonSegment(
                        value: TipoMovimentacao.saida,
                        label: Text('Saída'),
                        icon: Icon(Icons.arrow_upward),
                      ),
                    ],
                    selected: {tipo},
                    onSelectionChanged: (selection) {
                      _tipoMovimentacao.value = selection.first;
                    },
                  );
                },
              ),
              TextFormField(
                controller: _qtdeController,
                decoration: InputDecoration(
                  filled: true,
                  labelText: 'Quantidade',
                ),
                keyboardType: TextInputType.number,
                inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                textInputAction: TextInputAction.next,
                validator: (v) {
                  if (v == null || v.isEmpty || int.tryParse(v) == 0) {
                    return 'Quantidade inválida';
                  }
                  return null;
                },
              ),
              ValueListenableBuilder(
                valueListenable: _tipoMovimentacao,
                builder: (context, tipo, _) {
                  // Mostra o campo de fornecedor apenas para entradas
                  if (tipo == TipoMovimentacao.saida) {
                    return const SizedBox.shrink();
                  }
                  return TextFormField(
                    controller: _fornecedorController,
                    decoration: InputDecoration(
                      filled: true,
                      labelText: 'Fornecedor (Opcional)',
                    ),
                    textInputAction: TextInputAction.next,
                  );
                },
              ),
              TextFormField(
                controller: _notasController,
                decoration: InputDecoration(
                  filled: true,
                  labelText: 'Notas / Observação (Opcional)',
                  hintText: 'Ex: Perda por dano, recebimento NF-e 1234',
                  hintStyle: hintStyle(context),
                ),
                maxLines: 3,
                textInputAction: TextInputAction.done,
                onFieldSubmitted: (_) => _onPressedConfirmar(),
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
            iconPlacement: IconPlacement.right,
            isLoading: pressed,
            label: 'Confirmar',
            onPressed: _onPressedConfirmar,
            icon: Icon(Icons.check),
          ),
        ),
      ],
    );
  }

  Future<void> _onPressedConfirmar() async {
    if (_formKey.currentState?.validate() != true) return;
    if (_isPressed.value) return;
    _isPressed.value = true;

    final success = await MovimentacoesApi.create(
      CreateMovimentacaoDto(
        materialId: _selectedMaterial.value!.id,
        tipoMovimentacao: _tipoMovimentacao.value,
        dataMovimentacao: DateTime.now().toIso8601String(),
        qtde: int.parse(_qtdeController.text),
        fornecedor: _fornecedorController.text,
        notas: _notasController.text,
      ),
    );

    _isPressed.value = false;
    if (success && mounted) Navigator.of(context).pop(true);
  }
}
