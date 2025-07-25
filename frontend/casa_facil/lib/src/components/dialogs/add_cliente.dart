import 'package:casa_facil/src/api/clientes.dart';
import 'package:casa_facil/src/components/app_button.dart';
import 'package:casa_facil/src/components/dialogs/interface.dart';
import 'package:casa_facil/src/constants/constants.dart' show gaplg;
import 'package:casa_facil/src/utils/hint_style.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class AddCliente extends StatefulWidget implements DialogInterface {
  const AddCliente({super.key});

  @override
  State<AddCliente> createState() => _AddClienteState();
}

class _AddClienteState extends State<AddCliente> {
  static const double _maxWidth = 500;

  final _formKey = GlobalKey<FormState>();
  final _isPressed = ValueNotifier(false);

  final _nomeController = TextEditingController();
  final _emailController = TextEditingController();
  final _contatoController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      scrollable: true,
      title: const Text('Adicionar Cliente'),
      content: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: _maxWidth),
        child: SizedBox(
          width: double.maxFinite,
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
                    hintText: 'Maria Souza',
                    hintStyle: hintStyle(context),
                    labelText: 'Nome completo',
                  ),
                  keyboardType: TextInputType.name,
                  maxLength: 255,
                  maxLengthEnforcement: MaxLengthEnforcement.enforced,
                  textInputAction: TextInputAction.next,
                  validator: (value) {
                    if (value?.isNotEmpty == true) return null;
                    return 'O nome é obrigatório';
                  },
                ),
                TextFormField(
                  controller: _emailController,
                  decoration: InputDecoration(
                    filled: true,
                    hintText: 'maria.souza@email.com',
                    hintStyle: hintStyle(context),
                    labelText: 'Email',
                  ),
                  keyboardType: TextInputType.emailAddress,
                  maxLength: 100,
                  maxLengthEnforcement: MaxLengthEnforcement.enforced,
                  textInputAction: TextInputAction.next,
                ),
                TextFormField(
                  controller: _contatoController,
                  decoration: InputDecoration(
                    filled: true,
                    hintText: '(43) 99988-7766',
                    hintStyle: hintStyle(context),
                    labelText: 'Nº Contato',
                  ),
                  keyboardType: TextInputType.phone,
                  maxLength: 20,
                  maxLengthEnforcement: MaxLengthEnforcement.enforced,
                  textInputAction: TextInputAction.done,
                  onFieldSubmitted: (_) => _onPressedAdicionar(),
                ),
              ],
            ),
          ),
        ),
      ),
      actions: [
        AppButton.text(label: 'Cancelar', onPressed: _onPressedCancelar),
        ValueListenableBuilder(
          valueListenable: _isPressed,
          builder: (context, pressed, _) {
            return AppButton(
              isLoading: pressed,
              label: 'Adicionar',
              onPressed: _onPressedAdicionar,
              loadingWidget: const CircularProgressIndicator.adaptive(
                strokeWidth: 2,
              ),
            );
          },
        ),
      ],
    );
  }

  Future<void> _onPressedAdicionar() async {
    if (_formKey.currentState?.validate() != true) return;

    if (_isPressed.value) return;
    _isPressed.value = true;

    await ClientesApi.addCliente(
      nome: _nomeController.text,
      email: _emailController.text,
      nroContato: _contatoController.text,
    );

    _isPressed.value = false;
    if (mounted) {
      Navigator.of(context).pop(true); // Retorna true para indicar sucesso
    }
  }

  void _onPressedCancelar() {
    Navigator.of(context).pop();
  }
}
