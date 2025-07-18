import 'package:casa_facil/src/api/modelos_casas/modelos_casas.dart';
import 'package:casa_facil/src/components/app_button.dart';
import 'package:casa_facil/src/components/card.dart';
import 'package:casa_facil/src/components/dialogs/modelos_casas/add_modelo.dart';
import 'package:casa_facil/src/components/dialogs/modelos_casas/ver_detalhes.dart';
import 'package:casa_facil/src/components/responsive_grid.dart';
import 'package:casa_facil/src/constants/constants.dart'
    show gaplg, gapmd, gapsm, gapxxl;
import 'package:casa_facil/src/enums/window_class.dart';
import 'package:casa_facil/src/models/modelo_casa.dart';
import 'package:casa_facil/src/services/dialog/dialog.dart';
import 'package:casa_facil/src/utils/get_localization.dart';
import 'package:casa_facil/src/utils/hint_style.dart';
import 'package:flutter/material.dart';

class HouseCatalog extends StatefulWidget {
  const HouseCatalog({super.key});

  @override
  State<HouseCatalog> createState() => _HouseCatalogState();
}

class _HouseCatalogState extends State<HouseCatalog> {
  final _controller = TextEditingController();
  final _dialogs = DialogService.instance;
  final _notifier = ValueNotifier(false);

  List<ModeloCasaModel> _modelosCasa = [];

  WindowClass _windowClass = WindowClass.expanded;

  @override
  void initState() {
    super.initState();

    WidgetsBinding.instance.addPostFrameCallback((_) async => _genData());
  }

  @override
  Widget build(BuildContext context) {
    final newWC = WindowClass.fromWidth(MediaQuery.of(context).size.width);
    if (newWC != _windowClass) {
      setState(() => _windowClass = newWC);
    }

    final count = switch (_windowClass) {
      WindowClass.compact => 1,
      WindowClass.medium => 2,
      WindowClass.expanded => 3,
    };

    return Scaffold(
      body: Padding(
        padding: EdgeInsets.all(gapxxl).copyWith(top: 0),
        child: AppCard(
          title: localization(context).catalogCardTitle,
          subtitle: localization(context).catalogCardSubtitle,
          content: Container(
            padding: EdgeInsets.only(top: gapmd),
            width: double.maxFinite,
            child: Column(
              mainAxisSize: MainAxisSize.max,
              spacing: gapmd,
              children: [
                Row(
                  spacing: gaplg,
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _controller,
                        decoration: InputDecoration(
                          filled: true,
                          hintStyle: hintStyle(context),
                          hintText: 'Compacta',
                          labelText: 'Buscar modelo',
                          prefixIcon: Icon(Icons.search),
                        ),
                      ),
                    ),
                    AppButton(
                      label: 'Adicionar modelo',
                      onPressed: _addModelo,

                      icon: Icon(Icons.add_circle_outline),
                    ),
                  ],
                ),
                Flexible(
                  child: ListenableBuilder(
                    listenable: _notifier,
                    builder: (context, _) {
                      final rem = _modelosCasa.length % count;
                      final fill = count - rem;

                      return ResponsiveGrid(
                        crossAxisCount: count,
                        runSpacing: gapmd,
                        spacing: gapmd,
                        children: [
                          for (int i = 0; i < _modelosCasa.length + fill; i++)
                            _buildCard(i),
                        ],
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildCard(int index) {
    if (index >= _modelosCasa.length) {
      return SizedBox();
    }

    final ModeloCasaModel model = _modelosCasa[index];

    return AppCard.outlined(
      image: AspectRatio(
        aspectRatio: 600 / 400,
        child: Placeholder(
          child: Center(
            child: Text('400 x 600', style: TextTheme.of(context).displaySmall),
          ),
        ),
      ),
      title: model.nome,
      subtitle: model.descricao,
      content: Padding(
        padding: const EdgeInsets.only(top: gapsm),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            spacing: gapsm,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                spacing: gapsm,
                children: [
                  Icon(Icons.schedule),
                  Flexible(
                    child: Text(
                      '${localization(context).catalogBuildTimeLabel}: ${model.tempoFabricacao} dias',
                    ),
                  ),
                ],
              ),
              Align(
                alignment: Alignment.bottomRight,
                child: AppButton.outlined(
                  onPressed: () => _verDetalhes(model),
                  label: 'Ver detalhes',
                  icon: Icon(Icons.visibility),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _genData() async {
    _modelosCasa = await ModelosCasasApi.listAll();
    _notifier.value = !_notifier.value;
  }

  Future<void> _addModelo() async {
    await _dialogs.showDialog(AddModeloDialog());
    await _genData();
  }

  Future<void> _verDetalhes(ModeloCasaModel modelo) async {
    await _dialogs.showDialog(VerDetalhesDialog(modelo: modelo));
    await _genData();
  }
}
