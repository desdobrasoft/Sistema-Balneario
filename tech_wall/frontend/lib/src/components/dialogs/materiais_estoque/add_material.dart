import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:tech_wall/src/api/materiais_estoque/dto.dart';
import 'package:tech_wall/src/api/materiais_estoque/materiais_estoque.dart';
import 'package:tech_wall/src/api/tipos_materiais/tipos_materiais.dart';
import 'package:tech_wall/src/components/app_button.dart';
import 'package:tech_wall/src/components/dialogs/interface.dart';
import 'package:tech_wall/src/constants/constants.dart' show gaplg;
import 'package:tech_wall/src/models/tipo_material.dart';
import 'package:tech_wall/src/utils/hint_style.dart';

class AddMaterial extends StatefulWidget implements DialogInterface {
  const AddMaterial({super.key});

  @override
  State<AddMaterial> createState() => _AddMaterialState();
}

class _AddMaterialState extends State<AddMaterial> {
  static const double _maxWidth = 500;
  final _formKey = GlobalKey<FormState>();
  final _isPressed = ValueNotifier(false);

  final _idController = TextEditingController();
  final _itemController = TextEditingController();
  final _quantidadeController = TextEditingController();
  final _unidadeController = TextEditingController();
  final _observacaoController = TextEditingController();
  final _limiteController = TextEditingController();

  final _alturaController = TextEditingController();
  final _larguraController = TextEditingController();
  final _espessuraController = TextEditingController();
  final _tramaController = TextEditingController();

  final _selectedTipo = ValueNotifier<TipoMaterialModel?>(null);
  final _isPlaca = ValueNotifier<bool>(false);

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      scrollable: true,
      title: const Text('Adicionar Novo Material'),
      content: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: _maxWidth),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            spacing: gaplg,
            children: [
              TextFormField(
                autofocus: true,
                controller: _idController,
                decoration: InputDecoration(
                  filled: true,
                  hintText: 'SKU-001',
                  hintStyle: hintStyle(context),
                  labelText: 'ID / SKU do Material',
                ),
                textInputAction: TextInputAction.next,
                validator: (v) =>
                    v?.isNotEmpty == true ? null : 'O ID é obrigatório',
              ),
              TextFormField(
                controller: _itemController,
                decoration: InputDecoration(
                  filled: true,
                  hintText: 'Parafuso Sextavado 1/4"',
                  hintStyle: hintStyle(context),
                  labelText: 'Item',
                ),
                textInputAction: TextInputAction.next,
                validator: (v) =>
                    v?.isNotEmpty == true ? null : 'O item é obrigatório',
              ),
              FutureBuilder<List<TipoMaterialModel>>(
                future: TiposMateriaisApi.listAll(),
                builder: (context, snapshot) {
                  if (!snapshot.hasData) {
                    return const Center(child: CircularProgressIndicator());
                  }
                  return DropdownButtonFormField<TipoMaterialModel>(
                    decoration: const InputDecoration(
                      labelText: 'Tipo de Material',
                      filled: true,
                    ),
                    items: snapshot.data!
                        .map(
                          (t) =>
                              DropdownMenuItem(value: t, child: Text(t.nome)),
                        )
                        .toList(),
                    onChanged: (value) {
                      _selectedTipo.value = value;
                      _isPlaca.value = value?.nome.toUpperCase() == 'PLACAS';
                    },
                    validator: (v) => v == null ? 'Selecione um tipo' : null,
                  );
                },
              ),
              TextFormField(
                controller: _quantidadeController,
                decoration: InputDecoration(
                  filled: true,
                  labelText: 'Quantidade Inicial (Opcional)',
                ),
                keyboardType: TextInputType.number,
                inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                textInputAction: TextInputAction.next,
              ),
              TextFormField(
                controller: _unidadeController,
                decoration: InputDecoration(
                  filled: true,
                  labelText: 'Unidade (Opcional)',
                  hintText: 'un, m², m³...',
                  hintStyle: hintStyle(context),
                ),
                textInputAction: TextInputAction.next,
              ),
              TextFormField(
                controller: _observacaoController,
                decoration: InputDecoration(
                  filled: true,
                  labelText: 'Observação (Opcional)',
                ),
                textInputAction: TextInputAction.next,
              ),
              TextFormField(
                controller: _limiteController,
                decoration: InputDecoration(
                  filled: true,
                  labelText: 'Limite Baixo Estoque (Opcional)',
                ),
                keyboardType: TextInputType.number,
                inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                textInputAction: TextInputAction.done,
                onFieldSubmitted: (_) => _onPressedAdicionar(),
              ),
              ValueListenableBuilder<bool>(
                valueListenable: _isPlaca,
                builder: (context, isPlaca, _) {
                  if (!isPlaca) return const SizedBox.shrink();
                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    spacing: gaplg,
                    children: [
                      const Divider(),
                      Text(
                        'Especificações da Placa',
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                      TextFormField(
                        controller: _alturaController,
                        decoration: const InputDecoration(
                          labelText: 'Altura',
                          filled: true,
                        ),
                        keyboardType: TextInputType.number,
                      ),
                      TextFormField(
                        controller: _larguraController,
                        decoration: const InputDecoration(
                          labelText: 'Largura',
                          filled: true,
                        ),
                        keyboardType: TextInputType.number,
                      ),
                      TextFormField(
                        controller: _espessuraController,
                        decoration: const InputDecoration(
                          labelText: 'Espessura',
                          filled: true,
                        ),
                        keyboardType: TextInputType.number,
                      ),
                      TextFormField(
                        controller: _tramaController,
                        decoration: const InputDecoration(
                          labelText: 'Tipo de Trama',
                          filled: true,
                        ),
                      ),
                    ],
                  );
                },
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
            label: 'Adicionar',
            onPressed: _onPressedAdicionar,
          ),
        ),
      ],
    );
  }

  Future<void> _onPressedAdicionar() async {
    if (_formKey.currentState?.validate() != true) return;
    if (_isPressed.value) return;
    _isPressed.value = true;

    final dto = CreateMaterialDto(
      id: _idController.text,
      item: _itemController.text,
      tipoId: _selectedTipo.value!.id,
      quantidade: int.tryParse(_quantidadeController.text),
      unidade: _unidadeController.text,
      observacao: _observacaoController.text,
      limBaixoEstoque: int.tryParse(_limiteController.text),
      placaEspecificacao: _isPlaca.value
          ? PlacaEspecificacaoDto(
              altura: double.tryParse(_alturaController.text),
              largura: double.tryParse(_larguraController.text),
              espessura: double.tryParse(_espessuraController.text),
              tipoTrama: _tramaController.text,
            )
          : null,
    );

    await MateriaisEstoqueApi.addMaterial(dto);

    _isPressed.value = false;
    if (mounted) Navigator.of(context).pop(true);
  }
}
