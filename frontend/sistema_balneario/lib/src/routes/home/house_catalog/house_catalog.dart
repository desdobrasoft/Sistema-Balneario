import 'package:flutter/material.dart';
import 'package:sistema_balneario/src/components/button.dart';
import 'package:sistema_balneario/src/components/card.dart';
import 'package:sistema_balneario/src/components/limited_wrap.dart';
import 'package:sistema_balneario/src/components/responsive_grid.dart';
import 'package:sistema_balneario/src/constants/constants.dart'
    show gaplg, gapmd, gapsm, gapxxl;
import 'package:sistema_balneario/src/data/mock_data.dart';
import 'package:sistema_balneario/src/enums/window_class.dart';
import 'package:sistema_balneario/src/models/house_model.dart';
import 'package:sistema_balneario/src/utils/get_localization.dart';
import 'package:sistema_balneario/src/utils/hint_style.dart';

class HouseCatalog extends StatefulWidget {
  const HouseCatalog({super.key});

  @override
  State<HouseCatalog> createState() => _HouseCatalogState();
}

class _HouseCatalogState extends State<HouseCatalog> {
  final _controller = TextEditingController();

  WindowClass _windowClass = WindowClass.expanded;

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
                      onPressed: () {},

                      icon: Icon(Icons.add_circle_outline),
                    ),
                  ],
                ),
                Flexible(
                  child: ResponsiveGrid(
                    crossAxisCount: count,
                    runSpacing: gapmd,
                    spacing: gapmd,
                    children: [
                      for (int i = 0; i < houseModels.length; i++)
                        _buildCard(houseModels[i]),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildCard(HouseModel model) {
    final cats = model.materials
        .map((mat) => stockItems.firstWhere((item) => mat.id == item.id))
        .map((item) => item.category)
        .toSet();
    final categories = [...cats, ...cats];

    return AppCard.outlined(
      image: AspectRatio(
        aspectRatio: 600 / 400,
        child: Placeholder(
          child: Center(
            child: Text('400 x 600', style: TextTheme.of(context).displaySmall),
          ),
        ),
      ),
      title: model.name,
      subtitle: model.description,
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
                  Icon(Icons.checklist),
                  Flexible(
                    child: Text(
                      '${localization(context).catalogMaterialListLabel}:',
                    ),
                  ),
                ],
              ),
              LimitedWrap(
                runSpacing: gapsm,
                spacing: gapsm,
                chips: categories.map((cat) {
                  if ((cat ?? '').isNotEmpty) {
                    return FilterChip(onSelected: (_) {}, label: Text(cat!));
                  }
                  return const SizedBox();
                }).toList(),
              ),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                spacing: gapsm,
                children: [
                  Icon(Icons.schedule),
                  Flexible(
                    child: Text(
                      '${localization(context).catalogBuildTimeLabel}: ${model.productionTime}',
                    ),
                  ),
                ],
              ),
              Align(
                alignment: Alignment.bottomRight,
                child: AppButton.outlined(
                  onPressed: () {},
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
}
