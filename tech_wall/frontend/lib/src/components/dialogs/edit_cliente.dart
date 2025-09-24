import 'package:brasil_fields/brasil_fields.dart'
    show TelefoneInputFormatter, UtilBrasilFields;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:tech_wall/src/api/clientes/clientes.dart';
import 'package:tech_wall/src/api/clientes/dto.dart';
import 'package:tech_wall/src/components/app_button.dart';
import 'package:tech_wall/src/components/dialogs/interface.dart';
import 'package:tech_wall/src/constants/constants.dart' show gaplg;
import 'package:tech_wall/src/models/cliente.dart';
import 'package:tech_wall/src/utils/hint_style.dart';

class EditCliente extends StatefulWidget implements DialogInterface {
  const EditCliente({super.key, required this.cliente});

  final ClienteModel cliente;

  @override
  State<EditCliente> createState() => _EditClienteState();
}

class _EditClienteState extends State<EditCliente> {
  static const double _maxWidth = 500;

  final _formKey = GlobalKey<FormState>();
  final _isPressed = ValueNotifier(false);

  final _nomeController = TextEditingController();
  final _emailController = TextEditingController();
  final _contatoController = TextEditingController();

  @override
  void initState() {
    super.initState();
    // Preenche os campos com os dados existentes do cliente
    _nomeController.text = widget.cliente.nome;
    _emailController.text = widget.cliente.email;
    _contatoController.text = UtilBrasilFields.obterTelefone(
      widget.cliente.nroContato,
    );
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      scrollable: true,
      title: const Text('Editar Cliente'),
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
                  inputFormatters: [
                    FilteringTextInputFormatter.digitsOnly,
                    TelefoneInputFormatter(),
                  ],
                  keyboardType: TextInputType.phone,
                  maxLength: 20,
                  maxLengthEnforcement: MaxLengthEnforcement.enforced,
                  textInputAction: TextInputAction.done,
                  onFieldSubmitted: (_) => _onPressedConfirmar(),
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
              label: 'Confirmar',
              onPressed: _onPressedConfirmar,
              loadingWidget: const CircularProgressIndicator.adaptive(
                strokeWidth: 2,
              ),
            );
          },
        ),
      ],
    );
  }

  Future<void> _onPressedConfirmar() async {
    if (_formKey.currentState?.validate() != true) return;

    if (_isPressed.value) return;
    _isPressed.value = true;

    final success = await ClientesApi.editCliente(
      id: widget.cliente.id,
      dto: UpdateClienteDto(
        nome: _nomeController.text,
        email: _emailController.text,
        nroContato: _contatoController.text.replaceAll(RegExp(r'[^0-9]'), ''),
      ),
    );

    _isPressed.value = false;
    if (success && mounted) Navigator.of(context).pop(success);
  }

  void _onPressedCancelar() {
    Navigator.of(context).pop();
  }
}
