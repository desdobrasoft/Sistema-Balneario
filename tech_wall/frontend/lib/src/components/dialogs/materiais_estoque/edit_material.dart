import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:tech_wall/src/api/materiais_estoque/dto.dart';
import 'package:tech_wall/src/api/materiais_estoque/materiais_estoque.dart';
import 'package:tech_wall/src/api/tipos_materiais/tipos_materiais.dart';
import 'package:tech_wall/src/components/app_button.dart';
import 'package:tech_wall/src/components/dialogs/interface.dart';
import 'package:tech_wall/src/constants/constants.dart' show gaplg;
import 'package:tech_wall/src/models/material_estoque.dart';
import 'package:tech_wall/src/models/tipo_material.dart';
import 'package:tech_wall/src/utils/hint_style.dart';

class EditMaterial extends StatefulWidget implements DialogInterface {
  final MaterialEstoqueModel material;

  const EditMaterial({super.key, required this.material});

  @override
  State<EditMaterial> createState() => _EditMaterialState();
}

class _EditMaterialState extends State<EditMaterial> {
  static const double _maxWidth = 500;
  final _formKey = GlobalKey<FormState>();
  final _isPressed = ValueNotifier(false);

  late final TextEditingController _idController;
  late final TextEditingController _itemController;
  late final TextEditingController _quantidadeController;
  late final TextEditingController _unidadeController;
  late final TextEditingController _observacaoController;
  late final TextEditingController _limiteController;

  late final TextEditingController _alturaController;
  late final TextEditingController _larguraController;
  late final TextEditingController _espessuraController;
  late final TextEditingController _tramaController;

  late final ValueNotifier<TipoMaterialModel?> _selectedTipo;
  late final ValueNotifier<bool> _isPlaca;

  @override
  void initState() {
    super.initState();
    _idController = TextEditingController(text: widget.material.id);
    _itemController = TextEditingController(text: widget.material.item);
    _quantidadeController = TextEditingController(
      text: widget.material.quantidade.toString(),
    );
    _unidadeController = TextEditingController(text: widget.material.unidade);
    _observacaoController = TextEditingController(
      text: widget.material.observacao,
    );
    _limiteController = TextEditingController(
      text: widget.material.limBaixoEstoque.toString(),
    );

    _alturaController = TextEditingController(
      text: widget.material.placaEspecificacao?.altura?.toString() ?? '',
    );
    _larguraController = TextEditingController(
      text: widget.material.placaEspecificacao?.largura?.toString() ?? '',
    );
    _espessuraController = TextEditingController(
      text: widget.material.placaEspecificacao?.espessura?.toString() ?? '',
    );
    _tramaController = TextEditingController(
      text: widget.material.placaEspecificacao?.tipoTrama ?? '',
    );

    _selectedTipo = ValueNotifier(widget.material.tipo);
    _isPlaca = ValueNotifier(
      widget.material.tipo?.nome.toUpperCase() == 'PLACAS',
    );
  }

  @override
  void dispose() {
    _idController.dispose();
    _itemController.dispose();
    _quantidadeController.dispose();
    _unidadeController.dispose();
    _observacaoController.dispose();
    _limiteController.dispose();
    _alturaController.dispose();
    _larguraController.dispose();
    _espessuraController.dispose();
    _tramaController.dispose();
    _selectedTipo.dispose();
    _isPlaca.dispose();
    _isPressed.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      scrollable: true,
      title: const Text('Editar Material'),
      content: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: _maxWidth),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            spacing: gaplg,
            children: [
              TextFormField(
                readOnly: true,
                controller: _idController,
                decoration: InputDecoration(
                  filled: true,
                  hintText: 'SKU-001',
                  hintStyle: hintStyle(context),
                  labelText: 'ID / SKU do Material',
                ),
                textInputAction: TextInputAction.next,
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
                    initialValue: _selectedTipo.value,
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
                  labelText: 'Quantidade (Opcional)',
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
                onFieldSubmitted: (_) => _onPressedSalvar(),
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
            label: 'Salvar',
            onPressed: _onPressedSalvar,
          ),
        ),
      ],
    );
  }

  Future<void> _onPressedSalvar() async {
    if (_formKey.currentState?.validate() != true) return;
    if (_isPressed.value) return;
    _isPressed.value = true;

    final dto = UpdateMaterialDto(
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

    await MateriaisEstoqueApi.editMaterial(id: widget.material.id, dto: dto);

    _isPressed.value = false;
    if (mounted) Navigator.of(context).pop(true);
  }
}
