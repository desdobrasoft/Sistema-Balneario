import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:tech_wall/src/api/materiais_estoque/dto.dart';
import 'package:tech_wall/src/api/materiais_estoque/materiais_estoque.dart';
import 'package:tech_wall/src/components/app_button.dart';
import 'package:tech_wall/src/components/dialogs/interface.dart';
import 'package:tech_wall/src/constants/constants.dart' show gaplg;
import 'package:tech_wall/src/models/materiais_estoque.dart';
import 'package:tech_wall/src/utils/hint_style.dart';

class EditMaterial extends StatefulWidget implements DialogInterface {
  const EditMaterial({super.key, required this.material});

  final MateriaisEstoque material;

  @override
  State<EditMaterial> createState() => _EditMaterialState();
}

class _EditMaterialState extends State<EditMaterial> {
  static const double _maxWidth = 500;
  final _formKey = GlobalKey<FormState>();
  final _isPressed = ValueNotifier(false);

  final _nomeController = TextEditingController();
  final _limiteController = TextEditingController();

  @override
  void initState() {
    super.initState();
    // Preenche os campos com os dados existentes do material
    _nomeController.text = widget.material.nome;
    _limiteController.text = widget.material.limBaixoEstoque.toString();
  }

  @override
  void dispose() {
    _nomeController.dispose();
    _limiteController.dispose();
    _isPressed.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      scrollable: true,
      title: Text('Editar Material: ${widget.material.id}'),
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
                controller: _limiteController,
                decoration: const InputDecoration(
                  filled: true,
                  labelText: 'Limite Mínimo de Estoque',
                ),
                keyboardType: TextInputType.number,
                inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                textInputAction: TextInputAction.done,
                onFieldSubmitted: (_) => _onPressedConfirmar(),
              ),
              // Nota informativa para o usuário
              const ListTile(
                leading: Icon(Icons.info_outline),
                minLeadingWidth: 0,
                contentPadding: EdgeInsets.zero,
                title: Text(
                  'A quantidade em estoque só pode ser alterada através de uma movimentação (entrada/saída).',
                  style: TextStyle(fontSize: 12),
                ),
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
            label: 'Confirmar',
            onPressed: _onPressedConfirmar,
          ),
        ),
      ],
    );
  }

  Future<void> _onPressedConfirmar() async {
    if (_formKey.currentState?.validate() != true) return;
    if (_isPressed.value) return;
    _isPressed.value = true;

    final dto = UpdateMaterialDto(
      nome: _nomeController.text,
      limBaixoEstoque: int.tryParse(_limiteController.text),
    );

    final success = await MateriaisEstoqueApi.editMaterial(
      id: widget.material.id,
      dto: dto,
    );

    _isPressed.value = false;
    if (success && mounted) Navigator.of(context).pop(true);
  }
}
