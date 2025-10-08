import 'package:flutter/material.dart';
import 'package:tech_wall/src/api/modelos_casas/modelos_casas.dart';
import 'package:tech_wall/src/api/producao/dto.dart';
import 'package:tech_wall/src/api/producao/producao.dart';
import 'package:tech_wall/src/components/app_button.dart';
import 'package:tech_wall/src/components/dialogs/interface.dart';
import 'package:tech_wall/src/components/dialogs/utils/get_content_style.dart';
import 'package:tech_wall/src/constants/constants.dart';
import 'package:tech_wall/src/models/modelo_casa.dart';

class AddOrdemInternaDialog extends StatefulWidget implements DialogInterface {
  const AddOrdemInternaDialog({super.key});

  @override
  State<AddOrdemInternaDialog> createState() => _AddOrdemInternaDialogState();
}

class _AddOrdemInternaDialogState extends State<AddOrdemInternaDialog> {
  final _formKey = GlobalKey<FormState>();
  final _isSubmitting = ValueNotifier(false);
  ModeloCasaModel? _selectedModelo;
  List<ModeloCasaModel>? _modelos;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ModelosCasasApi.listAll().then((data) {
        setState(() => _modelos = data);
      });
    });
  }

  @override
  void dispose() {
    _isSubmitting.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_modelos == null) {
      return AlertDialog(
        scrollable: true,

        title: Text('Aguarde'),
        content: Row(
          crossAxisAlignment: CrossAxisAlignment.end,
          mainAxisSize: MainAxisSize.min,
          spacing: gapmd,
          children: [
            Flexible(
              child: Text(
                'Carregando, por favor aguarde...',
                style: contentStyle(context),
              ),
            ),
            CircularProgressIndicator(),
          ],
        ),
        actions: [
          AppButton(label: 'Cancelar', onPressed: Navigator.of(context).pop),
        ],
      );
    }
    return AlertDialog(
      title: const Text('Criar Ordem de Produção Interna'),
      content: SizedBox(
        width: 400,
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Selecione um modelo de casa para criar uma ordem de produção interna. Isso gerará uma venda e um cliente internos, que não aparecerão nas listagens principais.',
              ),
              const SizedBox(height: gaplg),
              DropdownButtonFormField<ModeloCasaModel>(
                decoration: const InputDecoration(
                  labelText: 'Modelo da Casa',
                  filled: true,
                ),
                items: _modelos!
                    .map((m) => DropdownMenuItem(value: m, child: Text(m.nome)))
                    .toList(),
                onChanged: (val) {
                  setState(() {
                    _selectedModelo = val;
                  });
                },
                validator: (val) => val == null ? 'Selecione um modelo' : null,
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
            label: 'Criar Ordem',
            onPressed: _submit,
          ),
        ),
      ],
    );
  }

  Future<void> _submit() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;

    if (_isSubmitting.value) return;
    _isSubmitting.value = true;

    final dto = CreateInternalOrderDto(modeloId: _selectedModelo!.id);

    final success = await ProducaoApi.createInternalOrder(dto);

    _isSubmitting.value = false;
    if (success && mounted) {
      Navigator.of(context).pop(true);
    }
  }
}
