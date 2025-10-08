import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:tech_wall/src/api/placas/dto.dart';
import 'package:tech_wall/src/api/placas/placas.dart';
import 'package:tech_wall/src/components/app_button.dart';
import 'package:tech_wall/src/components/dialogs/interface.dart';
import 'package:tech_wall/src/constants/constants.dart';
import 'package:tech_wall/src/models/placa.dart';

class BaixaProducaoDialog extends StatefulWidget implements DialogInterface {
  final Placa placa;
  const BaixaProducaoDialog({super.key, required this.placa});

  @override
  State<BaixaProducaoDialog> createState() => _BaixaProducaoDialogState();
}

class _BaixaProducaoDialogState extends State<BaixaProducaoDialog> {
  final _formKey = GlobalKey<FormState>();
  final _isSubmitting = ValueNotifier(false);
  final _quantidadeController = TextEditingController();
  bool _materiaisExpanded = false;

  @override
  void initState() {
    super.initState();
    _quantidadeController.addListener(() => setState(() {}));
  }

  @override
  void dispose() {
    _quantidadeController.dispose();
    _isSubmitting.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    return AlertDialog(
      scrollable: true,
      title: Text('Dar Baixa na Produção - ${widget.placa.nome}'),
      content: Form(
        key: _formKey,
        child: SizedBox(
          width: 400,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Esta ação irá consumir os materiais necessários do estoque e adicionar a quantidade informada diretamente às placas "Prontas".',
                style: textTheme.bodyMedium,
              ),
              const SizedBox(height: gaplg),
              TextFormField(
                controller: _quantidadeController,
                keyboardType: TextInputType.number,
                inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                decoration: const InputDecoration(
                  labelText: 'Quantidade para Dar Baixa',
                  filled: true,
                ),
                validator: (v) =>
                    (v == null || v.isEmpty) ? 'Obrigatório' : null,
              ),
              Padding(
                padding: const EdgeInsets.only(left: 4.0, top: gapsm),
                child: TextButton.icon(
                  style: TextButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 4),
                  ),
                  icon: Icon(
                    _materiaisExpanded
                        ? Icons.arrow_drop_up
                        : Icons.arrow_drop_down,
                  ),
                  label: const Text('Verificar materiais'),
                  onPressed: () {
                    setState(() {
                      _materiaisExpanded = !_materiaisExpanded;
                    });
                  },
                ),
              ),
              if (_materiaisExpanded) _buildMateriaisList(),
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

  Widget _buildMateriaisList() {
    final qtde = int.tryParse(_quantidadeController.text) ?? 0;
    final textTheme = Theme.of(context).textTheme;

    if (widget.placa.materiais.isEmpty) {
      return const Padding(
        padding: EdgeInsets.symmetric(vertical: gapsm),
        child: Text('Esta placa não possui materiais cadastrados.'),
      );
    }

    return Container(
      margin: const EdgeInsets.only(top: gapsm),
      padding: const EdgeInsets.all(gapsm),
      decoration: BoxDecoration(
        border: Border.all(color: Theme.of(context).dividerColor),
        borderRadius: BorderRadius.circular(gapsm),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Padding(
            padding: const EdgeInsets.only(left: 12, bottom: 4),
            child: Text(
              qtde > 0
                  ? 'Necessário para $qtde placa(s):'
                  : 'Material por placa:',
              style: textTheme.labelLarge,
            ),
          ),
          Column(
            mainAxisSize: MainAxisSize.min,
            children: widget.placa.materiais.map((material) {
              final necessarioPorPlaca = material.quantidade;
              final necessarioTotal = necessarioPorPlaca * qtde;
              final emEstoque = material.material?.quantidade ?? 0;
              final hasEnough = emEstoque >= necessarioTotal;

              return ListTile(
                dense: true,
                title: Text(material.material?.item ?? 'N/A'),
                trailing: Text.rich(
                  TextSpan(
                    style: textTheme.bodyMedium,
                    children: [
                      TextSpan(
                        text: qtde > 0
                            ? '$necessarioTotal'
                            : '$necessarioPorPlaca',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: qtde > 0 && !hasEnough
                              ? Theme.of(context).colorScheme.error
                              : null,
                        ),
                      ),
                      const TextSpan(text: ' / '),
                      TextSpan(text: '$emEstoque em estoque'),
                    ],
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  Future<void> _submit() async {
    if (_formKey.currentState?.validate() != true) return;

    final quantidade = int.tryParse(_quantidadeController.text);
    if (quantidade == null || quantidade == 0) return;

    if (_isSubmitting.value) return;
    _isSubmitting.value = true;

    final dto = BaixaProducaoPlacaDto(quantidade: quantidade);

    final success = await PlacasApi.baixaProducao(widget.placa.id, dto);

    _isSubmitting.value = false;
    if (success && mounted) {
      Navigator.of(context).pop(success);
    }
  }
}
