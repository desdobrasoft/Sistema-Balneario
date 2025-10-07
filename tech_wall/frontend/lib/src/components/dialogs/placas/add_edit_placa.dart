import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:multi_dropdown/multi_dropdown.dart';
import 'package:tech_wall/src/api/materiais_estoque/materiais_estoque.dart';
import 'package:tech_wall/src/api/placas/dto.dart';
import 'package:tech_wall/src/api/placas/placas.dart';
import 'package:tech_wall/src/components/app_button.dart';
import 'package:tech_wall/src/components/dialogs/interface.dart';
import 'package:tech_wall/src/components/dialogs/loading_dialog.dart';
import 'package:tech_wall/src/constants/constants.dart';
import 'package:tech_wall/src/models/material_estoque.dart';
import 'package:tech_wall/src/models/placa.dart';
import 'package:tech_wall/src/utils/hint_style.dart';

class AddEditPlacaDialog extends StatefulWidget implements DialogInterface {
  final Placa? placa;
  const AddEditPlacaDialog({super.key, this.placa});

  @override
  State<AddEditPlacaDialog> createState() => _AddEditPlacaDialogState();
}

class _AddEditPlacaDialogState extends State<AddEditPlacaDialog> {
  static const _maxWidth = 500.0;
  static const _qtdeWidth = 100.0;

  final _formKey = GlobalKey<FormState>();
  final _formKeyQtde = GlobalKey<FormState>();
  final _isSubmitting = ValueNotifier(false);

  final _nomeController = TextEditingController();
  final _descricaoController = TextEditingController();
  final _alturaController = TextEditingController();
  final _larguraController = TextEditingController();
  final _espessuraController = TextEditingController();
  final _tipoTramaController = TextEditingController();
  final _materiaisController = MultiSelectController<MaterialEstoqueModel>();

  late ColorScheme _scheme;
  late bool _isEdit;

  List<TextEditingController> _controllersMateriais = [];
  bool _isQuantidadeStep = false;
  List<MaterialEstoqueModel>? _materiaisDisponiveis;

  @override
  void initState() {
    super.initState();
    _isEdit = widget.placa != null;

    if (_isEdit) {
      final p = widget.placa!;
      _nomeController.text = p.nome;
      _descricaoController.text = p.descricao ?? '';
      _alturaController.text = p.altura?.toString() ?? '';
      _larguraController.text = p.largura?.toString() ?? '';
      _espessuraController.text = p.espessura?.toString() ?? '';
      _tipoTramaController.text = p.tipoTrama ?? '';
      _materiaisController.addListener(_preselectMaterialsListener);
    }

    WidgetsBinding.instance.addPostFrameCallback((_) {
      MateriaisEstoqueApi.listAll().then((materiais) {
        setState(() {
          _materiaisDisponiveis = materiais;
        });
      });
    });
  }

  @override
  void dispose() {
    _nomeController.dispose();
    _descricaoController.dispose();
    _alturaController.dispose();
    _larguraController.dispose();
    _espessuraController.dispose();
    _tipoTramaController.dispose();
    _materiaisController.removeListener(_preselectMaterialsListener);
    _materiaisController.dispose();
    _isSubmitting.dispose();
    for (var controller in _controllersMateriais) {
      controller.dispose();
    }
    super.dispose();
  }

  void _preselectMaterialsListener() {
    if (_materiaisController.items.isNotEmpty && _isEdit) {
      _materiaisController.removeListener(_preselectMaterialsListener);
      final placaMateriaisIds = widget.placa!.materiais
          .map((m) => m.materialId)
          .toSet();
      _materiaisController.selectWhere(
        (item) => placaMateriaisIds.contains(item.value.id),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    _scheme = Theme.of(context).colorScheme;

    if (_materiaisDisponiveis == null) {
      return const LoadingDialog(message: 'Carregando lista de materiais...');
    }

    return AlertDialog(
      scrollable: true,
      title: Text(_isEdit ? 'Editar Placa' : 'Adicionar Placa'),
      content: SizedBox(
        width: _maxWidth,
        child: Form(
          key: _isQuantidadeStep ? _formKeyQtde : _formKey,
          child: _isQuantidadeStep ? _buildQuantidadeStep() : _buildFormStep(),
        ),
      ),
      actions: _buildActions(),
    );
  }

  Widget _buildFormStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      spacing: gaplg,
      children: [
        TextFormField(
          autofocus: true,
          controller: _nomeController,
          decoration: const InputDecoration(labelText: 'Nome', filled: true),
          validator: (v) => v?.isEmpty ?? true ? 'Campo obrigatório' : null,
        ),
        TextFormField(
          controller: _descricaoController,
          decoration: const InputDecoration(
            labelText: 'Descrição',
            filled: true,
          ),
        ),
        Row(
          children: [
            Expanded(
              child: TextFormField(
                controller: _alturaController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: 'Altura (cm)',
                  filled: true,
                ),
              ),
            ),
            const SizedBox(width: gapmd),
            Expanded(
              child: TextFormField(
                controller: _larguraController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: 'Largura (cm)',
                  filled: true,
                ),
              ),
            ),
            const SizedBox(width: gapmd),
            Expanded(
              child: TextFormField(
                controller: _espessuraController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: 'Espessura (mm)',
                  filled: true,
                ),
              ),
            ),
          ],
        ),
        TextFormField(
          controller: _tipoTramaController,
          decoration: const InputDecoration(
            labelText: 'Tipo de Trama',
            filled: true,
          ),
        ),
        MultiDropdown(
          controller: _materiaisController,
          items: _materiaisDisponiveis!
              .map((m) => DropdownItem(label: m.item, value: m))
              .toList(),
          chipDecoration: ChipDecoration(
            backgroundColor: _scheme.primaryContainer,
            labelStyle: Theme.of(context).textTheme.labelLarge,
          ),
          dropdownDecoration: DropdownDecoration(
            backgroundColor: _scheme.surfaceContainerHighest,
            maxHeight: MediaQuery.of(context).size.height * 0.4,
          ),
          dropdownItemDecoration: DropdownItemDecoration(
            selectedBackgroundColor: _scheme.primaryContainer,
            selectedTextColor: _scheme.onPrimaryContainer,
            textColor: _scheme.onSurface,
          ),
          fieldDecoration: FieldDecoration(
            backgroundColor: _scheme.surfaceContainerHighest,
            border: UnderlineInputBorder(
              borderSide: BorderSide(color: _scheme.onSurfaceVariant),
            ),
            borderRadius: 0,
            labelText: 'Materiais',
            hintStyle: hintStyle(context),
          ),
        ),
      ],
    );
  }

  Widget _buildQuantidadeStep() {
    for (var controller in _controllersMateriais) {
      controller.dispose();
    }

    _controllersMateriais = _materiaisController.selectedItems.map((item) {
      String initialQty = '';
      if (_isEdit) {
        try {
          final existing = widget.placa!.materiais.firstWhere(
            (m) => m.materialId == item.value.id,
          );
          initialQty = existing.quantidade.toString();
        } catch (e) {
          // Material not found in the original placa, so it's a new addition.
        }
      }
      return TextEditingController(text: initialQty);
    }).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      spacing: gaplg,
      children: [
        Text(
          'Defina as quantidades para os materiais selecionados:',
          style: Theme.of(context).textTheme.titleMedium,
        ),
        const Divider(),
        if (_materiaisController.selectedItems.isEmpty)
          const Text('Nenhum material selecionado.'),
        ...List.generate(_materiaisController.selectedItems.length, (i) {
          final material = _materiaisController.selectedItems[i].value;
          final controller = _controllersMateriais[i];
          return Row(
            children: [
              Expanded(child: Text(material.item)),
              SizedBox(
                width: _qtdeWidth,
                child: TextFormField(
                  controller: controller,
                  textAlign: TextAlign.end,
                  keyboardType: TextInputType.number,
                  inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                  decoration: const InputDecoration(
                    filled: true,
                    labelText: 'Qtde.',
                  ),
                  validator: (v) =>
                      (int.tryParse(v ?? '0') ?? 0) <= 0 ? 'Inválido' : null,
                ),
              ),
            ],
          );
        }),
      ],
    );
  }

  List<Widget> _buildActions() {
    return [
      AppButton.text(
        label: _isQuantidadeStep ? 'Voltar' : 'Cancelar',
        onPressed: () {
          if (_isQuantidadeStep) {
            setState(() => _isQuantidadeStep = false);
          } else {
            Navigator.of(context).pop();
          }
        },
      ),
      ValueListenableBuilder<bool>(
        valueListenable: _isSubmitting,
        builder: (context, submitting, _) => AppButton(
          isLoading: submitting,
          label: _isQuantidadeStep
              ? (_isEdit ? 'Salvar' : 'Adicionar')
              : 'Próximo',
          onPressed: _submit,
        ),
      ),
    ];
  }

  Future<void> _submit() async {
    final form = _isQuantidadeStep ? _formKeyQtde : _formKey;
    if (form.currentState?.validate() != true) return;

    if (!_isQuantidadeStep) {
      setState(() => _isQuantidadeStep = true);
      return;
    }

    if (_isSubmitting.value) return;
    _isSubmitting.value = true;

    final materiais = List.generate(_materiaisController.selectedItems.length, (
      i,
    ) {
      return MaterialPlacaDto(
        materialId: _materiaisController.selectedItems[i].value.id,
        quantidade: int.parse(_controllersMateriais[i].text),
      );
    });

    bool success = false;
    if (_isEdit) {
      final dto = UpdatePlacaDto(
        nome: _nomeController.text,
        descricao: _descricaoController.text,
        altura: double.tryParse(_alturaController.text),
        largura: double.tryParse(_larguraController.text),
        espessura: double.tryParse(_espessuraController.text),
        tipoTrama: _tipoTramaController.text,
        materiais: materiais,
      );
      success = await PlacasApi.update(widget.placa!.id, dto);
    } else {
      final dto = CreatePlacaDto(
        nome: _nomeController.text,
        descricao: _descricaoController.text,
        altura: double.tryParse(_alturaController.text),
        largura: double.tryParse(_larguraController.text),
        espessura: double.tryParse(_espessuraController.text),
        tipoTrama: _tipoTramaController.text,
        materiais: materiais,
      );
      success = await PlacasApi.create(dto);
    }

    _isSubmitting.value = false;
    if (mounted) Navigator.of(context).pop(success);
  }
}
