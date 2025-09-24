import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:tech_wall/src/api/lancamentos/dto.dart';
import 'package:tech_wall/src/api/lancamentos/lancamentos.dart';
import 'package:tech_wall/src/components/app_button.dart';
import 'package:tech_wall/src/components/dialogs/interface.dart';
import 'package:tech_wall/src/constants/constants.dart';
import 'package:tech_wall/src/models/lancamento.dart';
import 'package:tech_wall/src/utils/formatador_moeda.dart';

class AddLancamentoDialog extends StatefulWidget implements DialogInterface {
  const AddLancamentoDialog({super.key});

  @override
  State<AddLancamentoDialog> createState() => _AddLancamentoDialogState();
}

class _AddLancamentoDialogState extends State<AddLancamentoDialog> {
  final _formKey = GlobalKey<FormState>();
  final _isPressed = ValueNotifier(false);

  final _descController = TextEditingController();
  final _valorController = TextEditingController(text: '0,00');
  final _vencimentoController = TextEditingController();

  TipoLancamento _tipo = TipoLancamento.despesa;
  DateTime? _dataVencimento;

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Adicionar Lançamento Manual'),
      content: Form(
        key: _formKey,
        child: SizedBox(
          width: 500,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            spacing: gaplg,
            children: [
              SegmentedButton<TipoLancamento>(
                segments: const [
                  ButtonSegment(
                    value: TipoLancamento.despesa,
                    label: Text('Despesa'),
                  ),
                  ButtonSegment(
                    value: TipoLancamento.receita,
                    label: Text('Receita'),
                  ),
                ],
                selected: {_tipo},
                onSelectionChanged: (selection) =>
                    setState(() => _tipo = selection.first),
              ),
              TextFormField(
                controller: _descController,
                decoration: const InputDecoration(
                  labelText: 'Descrição',
                  filled: true,
                ),
                validator: (v) =>
                    v?.isNotEmpty == true ? null : 'Descrição obrigatória',
              ),
              TextFormField(
                controller: _valorController,
                decoration: const InputDecoration(
                  labelText: 'Valor Total',
                  filled: true,
                  prefixText: 'R\$ ',
                ),
                keyboardType: TextInputType.number,
                inputFormatters: [CurrencyInputFormatter()],
                validator: (v) =>
                    (double.tryParse(v?.replaceAll(',', '.') ?? '0') ?? 0) <= 0
                    ? 'Valor inválido'
                    : null,
              ),
              TextFormField(
                controller: _vencimentoController,
                decoration: const InputDecoration(
                  labelText: 'Data de Vencimento',
                  filled: true,
                  suffixIcon: Icon(Icons.calendar_today),
                ),
                readOnly: true,
                onTap: _selectDate,
                validator: (v) =>
                    v?.isNotEmpty == true ? null : 'Data obrigatória',
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

  Future<void> _selectDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime(2020),
      lastDate: DateTime(2100),
    );
    if (picked != null) {
      setState(() {
        _dataVencimento = picked;
        _vencimentoController.text = DateFormat('dd/MM/yyyy').format(picked);
      });
    }
  }

  Future<void> _onPressedAdicionar() async {
    if (_formKey.currentState?.validate() != true) return;
    if (_isPressed.value) return;
    _isPressed.value = true;

    final dto = CreateLancamentoDto(
      tipo: _tipo,
      descricao: _descController.text,
      valorTotal: double.parse(_valorController.text.replaceAll(',', '.')),
      dataVencimento: _dataVencimento,
    );

    final success = await LancamentosApi.create(dto);
    _isPressed.value = false;
    if (success && mounted) Navigator.of(context).pop(true);
  }
}
