import 'package:flutter/material.dart';
import 'package:tech_wall/src/api/placas/placas.dart';
import 'package:tech_wall/src/components/app_button.dart';
import 'package:tech_wall/src/components/dialogs/base_dialog.dart';
import 'package:tech_wall/src/constants/constants.dart';
import 'package:tech_wall/src/models/placa.dart';

class GerenciarProducaoDialog extends StatefulWidget {
  final Placa placa;
  const GerenciarProducaoDialog({super.key, required this.placa});

  @override
  State<GerenciarProducaoDialog> createState() =>
      _GerenciarProducaoDialogState();
}

class _GerenciarProducaoDialogState extends State<GerenciarProducaoDialog> {
  final _iniciarController = TextEditingController();
  final _finalizarController = TextEditingController();

  @override
  void dispose() {
    _iniciarController.dispose();
    _finalizarController.dispose();
    super.dispose();
  }

  Future<void> _onConfirm() async {
    final iniciar = int.tryParse(_iniciarController.text);
    final finalizar = int.tryParse(_finalizarController.text);

    if (iniciar == null && finalizar == null) {
      return;
    }

    try {
      await PlacasApi.gerenciarProducao(widget.placa.id, {
        'iniciarProducao': iniciar,
        'finalizarProducao': finalizar,
      });
      Navigator.of(context).pop(true);
    } catch (e) {
      // Handle error
      Navigator.of(context).pop(false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return BaseDialog(
      title: 'Gerenciar Produção - ${widget.placa.nome}',
      body: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text('Aguardando: ${widget.placa.qtAguardandoProducao}'),
          Text('Em produção: ${widget.placa.qtEmProducao}'),
          Text('Prontas: ${widget.placa.qtPronta}'),
          const SizedBox(height: gaplg),
          TextField(
            controller: _iniciarController,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(
              labelText: 'Iniciar Produção (Quantidade)',
              hintText: 'Mover de 'Aguardando' para 'Em Produção'',
            ),
          ),
          const SizedBox(height: gapmd),
          TextField(
            controller: _finalizarController,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(
              labelText: 'Finalizar Produção (Quantidade)',
              hintText: 'Mover de 'Em Produção' para 'Pronto'',
            ),
          ),
        ],
      ),
      actions: [
        AppButton(
          label: 'Cancelar',
          onPressed: () => Navigator.of(context).pop(false),
        ),
        AppButton(
          label: 'Confirmar',
          onPressed: _onConfirm,
          variant: AppButtonVariant.filled,
        ),
      ],
    );
  }
}
