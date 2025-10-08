import 'package:flutter/material.dart';
import 'package:tech_wall/src/api/modelos_casas/modelos_casas.dart';
import 'package:tech_wall/src/api/producao/dto.dart';
import 'package:tech_wall/src/api/producao/producao.dart';
import 'package:tech_wall/src/components/app_button.dart';
import 'package:tech_wall/src/components/dialogs/interface.dart';
import 'package:tech_wall/src/components/dialogs/utils/get_content_style.dart';
import 'package:tech_wall/src/constants/constants.dart';
import 'package:tech_wall/src/models/modelo_casa.dart';
import 'package:tech_wall/src/models/ordem_producao.dart';
import 'package:tech_wall/src/models/status_producao.dart';

class IniciarProducaoDialog extends StatefulWidget implements DialogInterface {
  final OrdemProducaoModel ordem;
  const IniciarProducaoDialog({super.key, required this.ordem});

  @override
  State<IniciarProducaoDialog> createState() => _IniciarProducaoDialogState();
}

class _IniciarProducaoDialogState extends State<IniciarProducaoDialog> {
  final _isSubmitting = ValueNotifier(false);
  ModeloCasaModel? _modeloDetalhado;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchModeloDetalhes();
  }

  Future<void> _fetchModeloDetalhes() async {
    final modeloId = widget.ordem.venda.modelo?.id;
    if (modeloId == null) {
      setState(() => _isLoading = false);
      return;
    }

    final modelo = await ModelosCasasApi.getById(modeloId);
    if (mounted) {
      setState(() {
        _modeloDetalhado = modelo;
        _isLoading = false;
      });
    }
  }

  @override
  void dispose() {
    _isSubmitting.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
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

    final textTheme = Theme.of(context).textTheme;
    final scheme = Theme.of(context).colorScheme;
    final modelo = _modeloDetalhado;

    return AlertDialog(
      scrollable: true,
      title: Text('Iniciar Produção - Venda #${widget.ordem.venda.id}'),
      content: SizedBox(
        width: 400,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Ao confirmar, os materiais e placas necessários para o modelo "${modelo?.nome ?? 'N/A'}" serão debitados do estoque e a ordem de produção avançará para o status "Em Espera".',
              style: textTheme.bodyMedium,
            ),
            const Divider(height: gaplg * 2),
            Text('Materiais Necessários', style: textTheme.titleMedium),
            const SizedBox(height: gapmd),
            if (modelo?.materiais.isEmpty ?? true)
              const Text('Nenhum material cadastrado para este modelo.')
            else
              ...modelo!.materiais.map((materialRequerido) {
                final emEstoque = materialRequerido.material.quantidade;
                final necessario = materialRequerido.qtModelo;
                final hasEnough = emEstoque >= necessario;
                return ListTile(
                  dense: true,
                  contentPadding: EdgeInsets.zero,
                  title: Text(materialRequerido.material.item),
                  trailing: Text.rich(
                    TextSpan(
                      style: textTheme.bodyMedium,
                      children: [
                        TextSpan(
                          text: '$necessario un.',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: !hasEnough ? scheme.error : null,
                          ),
                        ),
                        TextSpan(text: ' / $emEstoque em estoque'),
                      ],
                    ),
                  ),
                );
              }),
            const Divider(height: gaplg * 2),
            Text('Placas Necessárias', style: textTheme.titleMedium),
            const SizedBox(height: gapmd),
            if (modelo?.placas.isEmpty ?? true)
              const Text('Nenhuma placa cadastrada para este modelo.')
            else
              ...modelo!.placas.map((placaRequerida) {
                final emEstoque = placaRequerida.placa.qtPronta;
                final necessario = placaRequerida.qtPlaca;
                final hasEnough = emEstoque >= necessario;
                return ListTile(
                  dense: true,
                  contentPadding: EdgeInsets.zero,
                  title: Text(placaRequerida.placa.nome),
                  trailing: Text.rich(
                    TextSpan(
                      style: textTheme.bodyMedium,
                      children: [
                        TextSpan(
                          text: '$necessario un.',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: !hasEnough ? scheme.error : null,
                          ),
                        ),
                        TextSpan(text: ' / $emEstoque em estoque'),
                      ],
                    ),
                  ),
                );
              }),
          ],
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
            label: 'Confirmar e Iniciar',
            onPressed: _submit,
          ),
        ),
      ],
    );
  }

  Future<void> _submit() async {
    if (_isSubmitting.value) return;
    _isSubmitting.value = true;

    final dto = UpdateOrdemProducaoDto(status: StatusProducao.emEspera);
    final success = await ProducaoApi.updateStatus(widget.ordem.id, dto);

    _isSubmitting.value = false;
    if (success && mounted) {
      Navigator.of(context).pop(true);
    }
  }
}
