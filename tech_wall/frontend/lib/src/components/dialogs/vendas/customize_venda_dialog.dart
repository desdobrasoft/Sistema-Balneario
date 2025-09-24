import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:tech_wall/src/api/materiais_estoque/materiais_estoque.dart';
import 'package:tech_wall/src/api/vendas/dto.dart';
import 'package:tech_wall/src/components/app_button.dart';
import 'package:tech_wall/src/components/dialogs/interface.dart';
import 'package:tech_wall/src/constants/constants.dart';
import 'package:tech_wall/src/models/material_estoque.dart';
import 'package:tech_wall/src/models/modelo_casa.dart';

class CustomizeVendaDialog extends StatefulWidget implements DialogInterface {
  final ModeloCasaModel baseModel;
  final List<VendaItemOverrideDto>? currentCustomization;

  const CustomizeVendaDialog({
    super.key,
    required this.baseModel,
    this.currentCustomization,
  });

  @override
  State<CustomizeVendaDialog> createState() => _CustomizeVendaDialogState();
}

class _CustomizeVendaDialogState extends State<CustomizeVendaDialog> {
  late final Map<String, int> _originalQuantities;
  late final Map<String, TextEditingController> _controllers;
  late List<MaterialEstoqueModel> _allMaterials;
  late List<MaterialEstoqueModel> _customMaterials;

  @override
  void initState() {
    super.initState();

    _originalQuantities = {
      for (var item in widget.baseModel.materiais)
        item.material.id: item.qtModelo,
    };

    _controllers = {};
    _customMaterials = [];

    // Initialize with current customization or base model
    if (widget.currentCustomization != null) {
      for (var item in widget.currentCustomization!) {
        _controllers[item.materialId] = TextEditingController(
          text: item.qtFinal.toString(),
        );
      }
    } else {
      for (var item in widget.baseModel.materiais) {
        _controllers[item.material.id] = TextEditingController(
          text: item.qtModelo.toString(),
        );
      }
    }

    // Fetch all materials for the add functionality
    _fetchAllMaterials();
  }

  Future<void> _fetchAllMaterials() async {
    final materials = await MateriaisEstoqueApi.listAll();
    setState(() {
      _allMaterials = materials;
      // Populate _customMaterials based on controllers
      _customMaterials = _controllers.keys.map((materialId) {
        return _allMaterials.firstWhere(
          (m) => m.id == materialId,
          orElse: () => MaterialEstoqueModel(
            id: materialId,
            item: 'Material Desconhecido',
            quantidade: 0,
          ),
        );
      }).toList();
    });
  }

  @override
  void dispose() {
    for (var controller in _controllers.values) {
      controller.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;

    return AlertDialog(
      title: Text('Customizar Materiais do Modelo: ${widget.baseModel.nome}'),
      content: SizedBox(
        width: 600,
        height: 500,
        child: _customMaterials.isEmpty
            ? const Center(child: CircularProgressIndicator())
            : Column(
                children: [
                  Expanded(
                    child: ListView.builder(
                      itemCount: _customMaterials.length,
                      itemBuilder: (context, index) {
                        final material = _customMaterials[index];
                        final controller = _controllers[material.id]!;
                        final originalQty = _originalQuantities[material.id];
                        final isCustomized =
                            originalQty == null ||
                            controller.text != originalQty.toString();

                        return ListTile(
                          title: Text(material.item),
                          trailing: SizedBox(
                            width: 100,
                            child: TextFormField(
                              controller: controller,
                              textAlign: TextAlign.center,
                              keyboardType: TextInputType.number,
                              inputFormatters: [
                                FilteringTextInputFormatter.digitsOnly,
                              ],
                              decoration: InputDecoration(
                                filled: true,
                                fillColor: isCustomized
                                    ? scheme.tertiaryContainer
                                    : null,
                                labelText: 'Qtde',
                              ),
                            ),
                          ),
                          leading: IconButton(
                            icon: const Icon(
                              Icons.remove_circle_outline,
                              color: Colors.red,
                            ),
                            onPressed: () => _removeMaterial(material.id),
                          ),
                        );
                      },
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.only(top: gapmd),
                    child: AppButton(
                      label: 'Adicionar Material',
                      icon: const Icon(Icons.add),
                      onPressed: _showAddMaterialDialog,
                    ),
                  ),
                ],
              ),
      ),
      actions: [
        AppButton.text(
          label: 'Cancelar',
          onPressed: () => Navigator.of(context).pop(),
        ),
        AppButton(
          label: 'Salvar Customização',
          onPressed: _saveCustomization,
          icon: const Icon(Icons.save),
        ),
      ],
    );
  }

  void _removeMaterial(String materialId) {
    setState(() {
      _controllers.remove(materialId)?.dispose();
      _customMaterials.removeWhere((m) => m.id == materialId);
    });
  }

  void _showAddMaterialDialog() async {
    final materialToAdd = await showDialog<MaterialEstoqueModel>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Adicionar Material'),
        content: SizedBox(
          width: 400,
          child: Autocomplete<MaterialEstoqueModel>(
            optionsBuilder: (textEditingValue) {
              if (textEditingValue.text.isEmpty) {
                return const Iterable.empty();
              }
              return _allMaterials.where(
                (m) => m.item.toLowerCase().contains(
                  textEditingValue.text.toLowerCase(),
                ),
              );
            },
            displayStringForOption: (option) => option.item,
            onSelected: (option) {
              Navigator.of(context).pop(option);
            },
          ),
        ),
      ),
    );

    if (materialToAdd != null && !_controllers.containsKey(materialToAdd.id)) {
      setState(() {
        _customMaterials.add(materialToAdd);
        _controllers[materialToAdd.id] = TextEditingController(text: '1');
      });
    }
  }

  void _saveCustomization() {
    final List<VendaItemOverrideDto> overrides = [];
    _controllers.forEach((materialId, controller) {
      final qty = int.tryParse(controller.text);
      if (qty != null && qty > 0) {
        overrides.add(
          VendaItemOverrideDto(materialId: materialId, qtFinal: qty),
        );
      }
    });
    Navigator.of(context).pop(overrides);
  }
}
