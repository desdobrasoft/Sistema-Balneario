import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_en.dart';
import 'app_localizations_pt.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'localization/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
    : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations? of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations);
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
        delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
      ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('en'),
    Locale('pt'),
    Locale('pt', 'BR'),
  ];

  /// TechWall
  ///
  /// In en, this message translates to:
  /// **'TechWall'**
  String get appTitle;

  /// No description provided for @loginUsernameLabel.
  ///
  /// In en, this message translates to:
  /// **'User'**
  String get loginUsernameLabel;

  /// No description provided for @loginUsernameHint.
  ///
  /// In en, this message translates to:
  /// **'exemple@email.com'**
  String get loginUsernameHint;

  /// No description provided for @loginUsernameError.
  ///
  /// In en, this message translates to:
  /// **'User is required'**
  String get loginUsernameError;

  /// No description provided for @loginPasswordLabel.
  ///
  /// In en, this message translates to:
  /// **'Password'**
  String get loginPasswordLabel;

  /// No description provided for @loginPasswordHint.
  ///
  /// In en, this message translates to:
  /// **'••••••'**
  String get loginPasswordHint;

  /// No description provided for @loginPasswordError.
  ///
  /// In en, this message translates to:
  /// **'Password is required'**
  String get loginPasswordError;

  /// No description provided for @loginSubmitButtonLabel.
  ///
  /// In en, this message translates to:
  /// **'Login'**
  String get loginSubmitButtonLabel;

  /// No description provided for @homeNavigationDashboardLabel.
  ///
  /// In en, this message translates to:
  /// **'Dashboard'**
  String get homeNavigationDashboardLabel;

  /// No description provided for @homeNavigationCustomersLabel.
  ///
  /// In en, this message translates to:
  /// **'Customers'**
  String get homeNavigationCustomersLabel;

  /// No description provided for @homeNavigationCatalogLabel.
  ///
  /// In en, this message translates to:
  /// **'House Catalog'**
  String get homeNavigationCatalogLabel;

  /// No description provided for @homeNavigationSalesRecordLabel.
  ///
  /// In en, this message translates to:
  /// **'Sales Record'**
  String get homeNavigationSalesRecordLabel;

  /// No description provided for @homeNavigationProgressLabel.
  ///
  /// In en, this message translates to:
  /// **'Assembly Progress'**
  String get homeNavigationProgressLabel;

  /// No description provided for @homeNavigationDeliveryLabel.
  ///
  /// In en, this message translates to:
  /// **'Delivery Management'**
  String get homeNavigationDeliveryLabel;

  /// No description provided for @homeNavigationFinanceLabel.
  ///
  /// In en, this message translates to:
  /// **'Finance'**
  String get homeNavigationFinanceLabel;

  /// No description provided for @homeNavigationStockLabel.
  ///
  /// In en, this message translates to:
  /// **'Stock'**
  String get homeNavigationStockLabel;

  /// No description provided for @homeNavigationSettingsLabel.
  ///
  /// In en, this message translates to:
  /// **'Settings'**
  String get homeNavigationSettingsLabel;

  /// No description provided for @homePopupLogoutLabel.
  ///
  /// In en, this message translates to:
  /// **'Logout'**
  String get homePopupLogoutLabel;

  /// No description provided for @tableActionsLabel.
  ///
  /// In en, this message translates to:
  /// **'Actions'**
  String get tableActionsLabel;

  /// No description provided for @dashboardTotalSalesCardTitle.
  ///
  /// In en, this message translates to:
  /// **'Total Sales'**
  String get dashboardTotalSalesCardTitle;

  /// No description provided for @dashboardTotalSalesCardSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Performance in the last 6 months.'**
  String get dashboardTotalSalesCardSubtitle;

  /// No description provided for @dashboardActiveProdsCardTitle.
  ///
  /// In en, this message translates to:
  /// **'Active Productions'**
  String get dashboardActiveProdsCardTitle;

  /// No description provided for @dashboardActiveProdsCardSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Currently active projects.'**
  String get dashboardActiveProdsCardSubtitle;

  /// No description provided for @dashboardAvgDeliveryTimeCardTitle.
  ///
  /// In en, this message translates to:
  /// **'Average Delivery Time'**
  String get dashboardAvgDeliveryTimeCardTitle;

  /// No description provided for @dashboardAvgDeliveryTimeCardSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Average for finished orders.'**
  String get dashboardAvgDeliveryTimeCardSubtitle;

  /// No description provided for @dashboardMonthlyOverviewCardTitle.
  ///
  /// In en, this message translates to:
  /// **'Monthly Sales Overview'**
  String get dashboardMonthlyOverviewCardTitle;

  /// No description provided for @dashboardMonthlyOverviewCardSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Monthly revenue.'**
  String get dashboardMonthlyOverviewCardSubtitle;

  /// No description provided for @dashboardProdStatusCardTitle.
  ///
  /// In en, this message translates to:
  /// **'Order Status'**
  String get dashboardProdStatusCardTitle;

  /// No description provided for @dashboardProdStatusCardSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Orders per stage.'**
  String get dashboardProdStatusCardSubtitle;

  /// No description provided for @dashboardDeliveryTimeAnalysisCardTitle.
  ///
  /// In en, this message translates to:
  /// **'Delivery Time Analysis'**
  String get dashboardDeliveryTimeAnalysisCardTitle;

  /// No description provided for @dashboardDeliveryTimeAnalysisCardSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Analysis of delivery time for each finished order.'**
  String get dashboardDeliveryTimeAnalysisCardSubtitle;

  /// No description provided for @customersCardTitle.
  ///
  /// In en, this message translates to:
  /// **'Customers Management'**
  String get customersCardTitle;

  /// No description provided for @customersCardSubtitle.
  ///
  /// In en, this message translates to:
  /// **'View, add, edit or remove client records.'**
  String get customersCardSubtitle;

  /// No description provided for @customersAddButtonLabel.
  ///
  /// In en, this message translates to:
  /// **'Add client'**
  String get customersAddButtonLabel;

  /// No description provided for @customerTableNameLabel.
  ///
  /// In en, this message translates to:
  /// **'Name'**
  String get customerTableNameLabel;

  /// No description provided for @customerTableEmailLabel.
  ///
  /// In en, this message translates to:
  /// **'Email'**
  String get customerTableEmailLabel;

  /// No description provided for @customerTablePhoneLabel.
  ///
  /// In en, this message translates to:
  /// **'Phone'**
  String get customerTablePhoneLabel;

  /// No description provided for @customerTableAddressLabel.
  ///
  /// In en, this message translates to:
  /// **'Address'**
  String get customerTableAddressLabel;

  /// No description provided for @customerTableSalesLabel.
  ///
  /// In en, this message translates to:
  /// **'Sales'**
  String get customerTableSalesLabel;

  /// No description provided for @customerFilterLabel.
  ///
  /// In en, this message translates to:
  /// **'Search customer'**
  String get customerFilterLabel;

  /// No description provided for @customerFilterHint.
  ///
  /// In en, this message translates to:
  /// **'John Smith'**
  String get customerFilterHint;

  /// No description provided for @catalogCardTitle.
  ///
  /// In en, this message translates to:
  /// **'House Model Catalog'**
  String get catalogCardTitle;

  /// No description provided for @catalogCardSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Browse premade house models. The main difference is the area and kit components.'**
  String get catalogCardSubtitle;

  /// No description provided for @catalogAddButtonLabel.
  ///
  /// In en, this message translates to:
  /// **'Add model'**
  String get catalogAddButtonLabel;

  /// No description provided for @catalogMaterialListLabel.
  ///
  /// In en, this message translates to:
  /// **'Kit materials categories'**
  String get catalogMaterialListLabel;

  /// No description provided for @catalogBuildTimeLabel.
  ///
  /// In en, this message translates to:
  /// **'Kit setup'**
  String get catalogBuildTimeLabel;
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) =>
      <String>['en', 'pt'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when language+country codes are specified.
  switch (locale.languageCode) {
    case 'pt':
      {
        switch (locale.countryCode) {
          case 'BR':
            return AppLocalizationsPtBr();
        }
        break;
      }
  }

  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'en':
      return AppLocalizationsEn();
    case 'pt':
      return AppLocalizationsPt();
  }

  throw FlutterError(
    'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
    'an issue with the localizations generation tool. Please file an issue '
    'on GitHub with a reproducible sample app and the gen-l10n configuration '
    'that was used.',
  );
}
