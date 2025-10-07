import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:tech_wall/src/api/placas/dto.dart';
import 'package:tech_wall/src/api/placas/placas.dart';
import 'package:tech_wall/src/components/app_button.dart';
import 'package:tech_wall/src/components/dialogs/interface.dart';
import 'package:tech_wall/src/constants/constants.dart';
import 'package:tech_wall/src/models/placa.dart';

class GerenciarProducaoDialog extends StatefulWidget implements DialogInterface {
  final Placa placa;
  const GerenciarProducaoDialog({super.key, required this.placa});

  @override
  State<GerenciarProducaoDialog> createState() =>
      _GerenciarProducaoDialogState();
}

class _GerenciarProducaoDialogState extends State<GerenciarProducaoDialog> {
  final _formKey = GlobalKey<FormState>();
  final _isSubmitting = ValueNotifier(false);
  final _iniciarController = TextEditingController();
  final _finalizarController = TextEditingController();

  @override
  void dispose() {
    _iniciarController.dispose();
    _finalizarController.dispose();
    _isSubmitting.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    return AlertDialog(
      title: Text('Gerenciar Produção - ${widget.placa.nome}'),
      content: Form(
        key: _formKey,
        child: SizedBox(
          width: 400,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            spacing: gaplg,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _buildQtdeChip(
                      'Aguardando', widget.placa.qtAguardandoProducao, textTheme),
                  _buildQtdeChip(
                      'Em Produção', widget.placa.qtEmProducao, textTheme),
                  _buildQtdeChip('Prontas', widget.placa.qtPronta, textTheme),
                ],
              ),
              const Divider(),
              TextFormField(
                controller: _iniciarController,
                keyboardType: TextInputType.number,
                inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                decoration: const InputDecoration(
                  labelText: 'Iniciar Produção (Qtde)',
                  hintText: 'Aguardando -> Em Produção',
                  filled: true,
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) return null;
                  final qt = int.tryParse(value) ?? 0;
                  if (qt > widget.placa.qtAguardandoProducao) {
                    return 'Insuficiente';
                  }
                  return null;
                },
              ),
              TextFormField(
                controller: _finalizarController,
                keyboardType: TextInputType.number,
                inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                decoration: const InputDecoration(
                  labelText: 'Finalizar Produção (Qtde)',
                  hintText: 'Em Produção -> Pronta',
                  filled: true,
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) return null;
                  final qt = int.tryParse(value) ?? 0;
                  if (qt > widget.placa.qtEmProducao) {
                    return 'Insuficiente';
                  }
                  return null;
                },
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
        ValueListenableBuilder<bool>(
          valueListenable: _isSubmitting,
          builder: (context, submitting, _) => AppButton(
            isLoading: submitting,
            label: 'Confirmar',
            onPressed: _submit,
          ),
        ),
      ],
    );
  }

  Widget _buildQtdeChip(String label, int quantity, TextTheme textTheme) {
    return Column(
      children: [
        Text(label, style: textTheme.labelLarge),
        const SizedBox(height: gapsm),
        Chip(label: Text(quantity.toString(), style: textTheme.titleMedium)),
      ],
    );
  }

  Future<void> _submit() async {
    if (_formKey.currentState?.validate() != true) return;

    final iniciar = int.tryParse(_iniciarController.text);
    final finalizar = int.tryParse(_finalizarController.text);

    if ((iniciar == null || iniciar == 0) &&
        (finalizar == null || finalizar == 0)) {
      return;
    }

    if (_isSubmitting.value) return;
    _isSubmitting.value = true;

    final dto = GerenciarProducaoPlacaDto(
      iniciarProducao: iniciar,
      finalizarProducao: finalizar,
    );

    final success = await PlacasApi.gerenciarProducao(widget.placa.id, dto);

    _isSubmitting.value = false;
    if (mounted) Navigator.of(context).pop(success);
  }
}
