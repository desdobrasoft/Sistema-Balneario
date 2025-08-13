import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:tech_wall/src/api/materiais_estoque/dto.dart';
import 'package:tech_wall/src/api/materiais_estoque/materiais_estoque.dart';
import 'package:tech_wall/src/components/app_button.dart';
import 'package:tech_wall/src/components/dialogs/interface.dart';
import 'package:tech_wall/src/constants/constants.dart' show gaplg;
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
  final _nomeController = TextEditingController();
  final _estoqueController = TextEditingController();
  final _limiteController = TextEditingController();

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
                controller: _nomeController,
                decoration: InputDecoration(
                  filled: true,
                  hintText: 'Parafuso Sextavado 1/4"',
                  hintStyle: hintStyle(context),
                  labelText: 'Nome do Material',
                ),
                textInputAction: TextInputAction.next,
                validator: (v) =>
                    v?.isNotEmpty == true ? null : 'O nome é obrigatório',
              ),
              TextFormField(
                controller: _estoqueController,
                decoration: InputDecoration(
                  filled: true,
                  labelText: 'Estoque Inicial (Opcional)',
                ),
                keyboardType: TextInputType.number,
                inputFormatters: [FilteringTextInputFormatter.digitsOnly],
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

    await MateriaisEstoqueApi.addMaterial(
      CreateMaterialDto(
        id: _idController.text,
        nome: _nomeController.text,
        qtEstoque: int.tryParse(_estoqueController.text),
        limBaixoEstoque: int.tryParse(_limiteController.text),
      ),
    );

    _isPressed.value = false;
    if (mounted) Navigator.of(context).pop(true);
  }
}
