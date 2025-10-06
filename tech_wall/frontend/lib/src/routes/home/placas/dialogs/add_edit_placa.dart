import 'package:flutter/material.dart';
import 'package:tech_wall/src/api/materiais_estoque/materiais_estoque.dart';
import 'package:tech_wall/src/api/placas/placas.dart';
import 'package:tech_wall/src/components/app_button.dart';
import 'package:tech_wall/src/components/dialogs/base_dialog.dart';
import 'package:tech_wall/src/constants/constants.dart';
import 'package:tech_wall/src/models/material_estoque.dart';
import 'package:tech_wall/src/models/material_placa.dart';
import 'package:tech_wall/src/models/placa.dart';

class AddEditPlacaDialog extends StatefulWidget {
  final Placa? placa;
  const AddEditPlacaDialog({super.key, this.placa});

  @override
  State<AddEditPlacaDialog> createState() => _AddEditPlacaDialogState();
}

class _AddEditPlacaDialogState extends State<AddEditPlacaDialog> {
  final _formKey = GlobalKey<FormState>();
  final _nomeController = TextEditingController();
  final _descricaoController = TextEditingController();
  final _alturaController = TextEditingController();
  final _larguraController = TextEditingController();
  final _espessuraController = TextEditingController();
  final _tipoTramaController = TextEditingController();

  List<MaterialPlaca> _materiais = [];
  List<MaterialEstoqueModel> _materiaisDisponiveis = [];

  @override
  void initState() {
    super.initState();
    if (widget.placa != null) {
      _nomeController.text = widget.placa!.nome;
      _descricaoController.text = widget.placa!.descricao ?? '';
      _alturaController.text = widget.placa!.altura?.toString() ?? '';
      _larguraController.text = widget.placa!.largura?.toString() ?? '';
      _espessuraController.text = widget.placa!.espessura?.toString() ?? '';
      _tipoTramaController.text = widget.placa!.tipoTrama ?? '';
      _materiais = List.from(widget.placa!.materiais);
    }
    _loadMateriais();
  }

  Future<void> _loadMateriais() async {
    try {
      final materiais = await MateriaisEstoqueApi.listAll();
      setState(() {
        _materiaisDisponiveis = materiais;
      });
    } catch (e) {
      // Handle error
    }
  }

  Future<void> _onConfirm() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    final data = {
      'nome': _nomeController.text,
      'descricao': _descricaoController.text,
      'altura': double.tryParse(_alturaController.text),
      'largura': double.tryParse(_larguraController.text),
      'espessura': double.tryParse(_espessuraController.text),
      'tipo_trama': _tipoTramaController.text,
      'materiais': _materiais
          .map((m) => {
                'material_id': m.materialId,
                'quantidade': m.quantidade,
              })
          .toList(),
    };

    try {
      if (widget.placa == null) {
        await PlacasApi.create(data);
      } else {
        await PlacasApi.update(widget.placa!.id, data);
      }
      Navigator.of(context).pop(true);
    } catch (e) {
      // Handle error
      Navigator.of(context).pop(false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return BaseDialog(
      title: widget.placa == null ? 'Adicionar Placa' : 'Editar Placa',
      body: Form(
        key: _formKey,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextFormField(
              controller: _nomeController,
              decoration: const InputDecoration(labelText: 'Nome'),
              validator: (value) =>
                  value?.isEmpty ?? true ? 'Campo obrigatório' : null,
            ),
            TextFormField(
              controller: _descricaoController,
              decoration: const InputDecoration(labelText: 'Descrição'),
            ),
            Row(
              children: [
                Expanded(
                  child: TextFormField(
                    controller: _alturaController,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(labelText: 'Altura'),
                  ),
                ),
                const SizedBox(width: gapmd),
                Expanded(
                  child: TextFormField(
                    controller: _larguraController,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(labelText: 'Largura'),
                  ),
                ),
                const SizedBox(width: gapmd),
                Expanded(
                  child: TextFormField(
                    controller: _espessuraController,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(labelText: 'Espessura'),
                  ),
                ),
              ],
            ),
            TextFormField(
              controller: _tipoTramaController,
              decoration: const InputDecoration(labelText: 'Tipo de Trama'),
            ),
            const SizedBox(height: gaplg),
            _buildMateriaisSection(),
          ],
        ),
      ),
      actions: [
        AppButton(
          label: 'Cancelar',
          onPressed: () => Navigator.of(context).pop(false),
        ),
        AppButton(
          label: 'Salvar',
          onPressed: _onConfirm,
          variant: AppButtonVariant.filled,
        ),
      ],
    );
  }

  Widget _buildMateriaisSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Materiais Necessários', style: TextStyle(fontSize: 16)),
        const SizedBox(height: gapmd),
        ..._materiais.map((material) => ListTile(
              title: Text(material.material?.item ?? material.materialId),
              trailing: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text('Qtde: ${material.quantidade}'),
                  IconButton(
                    icon: const Icon(Icons.delete),
                    onPressed: () {
                      setState(() {
                        _materiais.remove(material);
                      });
                    },
                  ),
                ],
              ),
            )),
        const SizedBox(height: gapmd),
        AppButton(
          label: 'Adicionar Material',
          onPressed: _showAddMaterialDialog,
        ),
      ],
    );
  }

  void _showAddMaterialDialog() {
    final materialController = TextEditingController();
    final quantidadeController = TextEditingController();
    MaterialEstoqueModel? selectedMaterial;

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Adicionar Material'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            DropdownButtonFormField<MaterialEstoqueModel>(
              items: _materiaisDisponiveis
                  .map((m) => DropdownMenuItem(
                        value: m,
                        child: Text(m.item),
                      ))
                  .toList(),
              onChanged: (value) {
                selectedMaterial = value;
              },
              decoration: const InputDecoration(labelText: 'Material'),
            ),
            TextFormField(
              controller: quantidadeController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: 'Quantidade'),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancelar'),
          ),
          TextButton(
            onPressed: () {
              if (selectedMaterial != null &&
                  int.tryParse(quantidadeController.text) != null) {
                setState(() {
                  _materiais.add(MaterialPlaca(
                    materialId: selectedMaterial!.id,
                    quantidade: int.parse(quantidadeController.text),
                    material: selectedMaterial,
                  ));
                });
                Navigator.of(context).pop();
              }
            },
            child: const Text('Adicionar'),
          ),
        ],
      ),
    );
  }
}
