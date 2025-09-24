import 'package:flutter/widgets.dart' show BuildContext;
import 'package:tech_wall/src/localization/app_localizations.dart'
    show AppLocalizations;

AppLocalizations localization(BuildContext context) {
  return AppLocalizations.of(context)!;
}
