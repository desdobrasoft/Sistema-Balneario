import 'package:casa_facil/src/api/clientes/clientes.dart';
import 'package:casa_facil/src/api/modelos_casas/modelos_casas.dart';
import 'package:casa_facil/src/api/vendas/dto.dart';
import 'package:casa_facil/src/api/vendas/vendas.dart';
import 'package:casa_facil/src/components/app_button.dart';
import 'package:casa_facil/src/components/dialogs/interface.dart';
import 'package:casa_facil/src/constants/constants.dart' show gaplg;
import 'package:casa_facil/src/models/cliente.dart';
import 'package:casa_facil/src/models/modelo_casa.dart';
import 'package:casa_facil/src/utils/formatador_moeda.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class AddVendaDialog extends StatefulWidget implements DialogInterface {
  const AddVendaDialog({super.key});

  @override
  State<AddVendaDialog> createState() => _AddVendaDialogState();
}

class _AddVendaDialogState extends State<AddVendaDialog> {
  static const double _maxWidth = 500;
  final _formKey = GlobalKey<FormState>();
  final _isPressed = ValueNotifier(false);

  final _controllerPreco = TextEditingController(text: '0,00');
  final _controllerData = TextEditingController();
  final _controllerEndereco = TextEditingController();

  final _selectedCliente = ValueNotifier<ClienteModel?>(null);
  final _selectedModelo = ValueNotifier<ModeloCasaModel?>(null);
  final _selectedDate = ValueNotifier<DateTime?>(null);

  @override
  void initState() {
    super.initState();
    _selectedDate.value = DateTime.now();
    _controllerData.text = DateFormat(
      'dd/MM/yyyy',
    ).format(_selectedDate.value!);
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      scrollable: true,
      title: const Text('Registrar Nova Venda'),
      content: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: _maxWidth),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            spacing: gaplg,
            children: [
              // Dropdown para Clientes
              FutureBuilder<List<ClienteModel>>(
                future: ClientesApi.listAll(),
                builder: (context, snapshot) {
                  if (!snapshot.hasData) {
                    return const Center(child: CircularProgressIndicator());
                  }
                  return DropdownButtonFormField<ClienteModel>(
                    decoration: const InputDecoration(
                      labelText: 'Cliente',
                      filled: true,
                    ),
                    items: snapshot.data!
                        .map(
                          (c) =>
                              DropdownMenuItem(value: c, child: Text(c.nome)),
                        )
                        .toList(),
                    onChanged: (value) => _selectedCliente.value = value,
                    validator: (v) => v == null ? 'Selecione um cliente' : null,
                  );
                },
              ),
              // Dropdown para Modelos de Casa
              FutureBuilder<List<ModeloCasaModel>>(
                future: ModelosCasasApi.listAll(),
                builder: (context, snapshot) {
                  if (!snapshot.hasData) {
                    return const Center(child: CircularProgressIndicator());
                  }
                  return DropdownButtonFormField<ModeloCasaModel>(
                    decoration: const InputDecoration(
                      labelText: 'Modelo da Casa',
                      filled: true,
                    ),
                    items: snapshot.data!
                        .map(
                          (m) =>
                              DropdownMenuItem(value: m, child: Text(m.nome)),
                        )
                        .toList(),
                    onChanged: (value) {
                      _selectedModelo.value = value;
                      // Preenche o preço automaticamente, permitindo edição
                      if (value != null) {
                        final formattedPrice = value.preco
                            .toStringAsFixed(2)
                            .replaceAll('.', ',');
                        _controllerPreco.text = formattedPrice;
                      }
                    },
                    validator: (v) => v == null ? 'Selecione um modelo' : null,
                  );
                },
              ),
              TextFormField(
                controller: _controllerPreco,
                decoration: const InputDecoration(
                  labelText: 'Preço Final da Venda',
                  filled: true,
                  prefixText: 'R\$ ',
                ),
                keyboardType: TextInputType.number,
                inputFormatters: [CurrencyInputFormatter()],
                validator: (v) {
                  final value =
                      double.tryParse(v?.replaceAll(',', '.') ?? '0') ?? 0;
                  if (value <= 0) return 'O preço deve ser maior que zero';
                  return null;
                },
              ),
              // TODO: autocompletar por CEP.
              TextFormField(
                controller: _controllerEndereco,
                decoration: const InputDecoration(
                  labelText: 'Endereço de Entrega',
                  filled: true,
                  hintText: 'Rua das Flores, 123, Bairro, Cidade - Estado, CEP',
                ),
                maxLines: 3,
                keyboardType: TextInputType.multiline,
                textInputAction: TextInputAction.next,
                validator: (v) =>
                    v?.isNotEmpty == true ? null : 'O endereço é obrigatório',
              ),
              TextFormField(
                controller: _controllerData,
                decoration: const InputDecoration(
                  labelText: 'Data da Venda',
                  filled: true,
                  suffixIcon: Icon(Icons.calendar_today),
                ),
                readOnly: true,
                onTap: _selectDate,
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
            label: 'Registrar',
            onPressed: _onPressedRegistrar,
            icon: Icon(Icons.check),
          ),
        ),
      ],
    );
  }

  Future<void> _selectDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate.value ?? DateTime.now(),
      firstDate: DateTime(2020),
      lastDate: DateTime(2100),
    );
    if (picked != null && picked != _selectedDate.value) {
      _selectedDate.value = picked;
      _controllerData.text = DateFormat('dd/MM/yyyy').format(picked);
    }
  }

  Future<void> _onPressedRegistrar() async {
    if (_formKey.currentState?.validate() != true) return;
    if (_isPressed.value) return;
    _isPressed.value = true;

    final dto = CreateVendaDto(
      clienteId: _selectedCliente.value!.id,
      modeloId: _selectedModelo.value!.id,
      dataVenda: _selectedDate.value!,
      preco: double.parse(_controllerPreco.text.replaceAll(',', '.')),
      enderecoEntrega: _controllerEndereco.text,
    );

    final novaVenda = await VendasApi.addVenda(dto);

    _isPressed.value = false;
    if (mounted && novaVenda != null) Navigator.of(context).pop(true);
  }
}
