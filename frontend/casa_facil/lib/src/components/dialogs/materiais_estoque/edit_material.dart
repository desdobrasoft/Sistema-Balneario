import 'package:casa_facil/src/api/materiais_estoque/dto.dart';
import 'package:casa_facil/src/api/materiais_estoque/materiais_estoque.dart';
import 'package:casa_facil/src/components/app_button.dart';
import 'package:casa_facil/src/components/dialogs/interface.dart';
import 'package:casa_facil/src/constants/constants.dart' show gaplg;
import 'package:casa_facil/src/models/materiais_estoque.dart';
import 'package:casa_facil/src/utils/hint_style.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

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
  final _estoqueController = TextEditingController();
  final _limiteController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _nomeController.text = widget.material.nome;
    _estoqueController.text = widget.material.qtEstoque.toString();
    _limiteController.text = widget.material.limBaixoEstoque.toString();
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
                controller: _estoqueController,
                decoration: InputDecoration(
                  filled: true,
                  labelText: 'Quantidade em Estoque',
                ),
                keyboardType: TextInputType.number,
                inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                textInputAction: TextInputAction.next,
              ),
              TextFormField(
                controller: _limiteController,
                decoration: InputDecoration(
                  filled: true,
                  labelText: 'Limite Baixo Estoque',
                ),
                keyboardType: TextInputType.number,
                inputFormatters: [FilteringTextInputFormatter.digitsOnly],
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

    final success = await MateriaisEstoqueApi.editMaterial(
      id: widget.material.id,
      dto: UpdateMaterialDto(
        nome: _nomeController.text,
        qtEstoque: int.tryParse(_estoqueController.text),
        limBaixoEstoque: int.tryParse(_limiteController.text),
      ),
    );

    _isPressed.value = false;
    if (success && mounted) Navigator.of(context).pop(true);
  }
}
