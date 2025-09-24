// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get appTitle => 'TechWall';

  @override
  String get loginUsernameLabel => 'User';

  @override
  String get loginUsernameHint => 'exemple@email.com';

  @override
  String get loginUsernameError => 'User is required';

  @override
  String get loginPasswordLabel => 'Password';

  @override
  String get loginPasswordHint => '••••••';

  @override
  String get loginPasswordError => 'Password is required';

  @override
  String get loginSubmitButtonLabel => 'Login';

  @override
  String get homeNavigationDashboardLabel => 'Dashboard';

  @override
  String get homeNavigationCustomersLabel => 'Customers';

  @override
  String get homeNavigationCatalogLabel => 'House Catalog';

  @override
  String get homeNavigationSalesRecordLabel => 'Sales Record';

  @override
  String get homeNavigationProgressLabel => 'Assembly Progress';

  @override
  String get homeNavigationDeliveryLabel => 'Delivery Management';

  @override
  String get homeNavigationFinanceLabel => 'Finance';

  @override
  String get homeNavigationStockLabel => 'Stock';

  @override
  String get homeNavigationSettingsLabel => 'Settings';

  @override
  String get homePopupLogoutLabel => 'Logout';

  @override
  String get tableActionsLabel => 'Actions';

  @override
  String get dashboardTotalSalesCardTitle => 'Total Sales';

  @override
  String get dashboardTotalSalesCardSubtitle =>
      'Performance in the last 6 months.';

  @override
  String get dashboardActiveProdsCardTitle => 'Active Productions';

  @override
  String get dashboardActiveProdsCardSubtitle => 'Currently active projects.';

  @override
  String get dashboardAvgDeliveryTimeCardTitle => 'Average Delivery Time';

  @override
  String get dashboardAvgDeliveryTimeCardSubtitle =>
      'Average for finished orders.';

  @override
  String get dashboardMonthlyOverviewCardTitle => 'Monthly Sales Overview';

  @override
  String get dashboardMonthlyOverviewCardSubtitle => 'Monthly revenue.';

  @override
  String get dashboardProdStatusCardTitle => 'Order Status';

  @override
  String get dashboardProdStatusCardSubtitle => 'Orders per stage.';

  @override
  String get dashboardDeliveryTimeAnalysisCardTitle => 'Delivery Time Analysis';

  @override
  String get dashboardDeliveryTimeAnalysisCardSubtitle =>
      'Analysis of delivery time for each finished order.';

  @override
  String get customersCardTitle => 'Customers Management';

  @override
  String get customersCardSubtitle =>
      'View, add, edit or remove client records.';

  @override
  String get customersAddButtonLabel => 'Add client';

  @override
  String get customerTableNameLabel => 'Name';

  @override
  String get customerTableEmailLabel => 'Email';

  @override
  String get customerTablePhoneLabel => 'Phone';

  @override
  String get customerTableAddressLabel => 'Address';

  @override
  String get customerTableSalesLabel => 'Sales';

  @override
  String get customerFilterLabel => 'Search customer';

  @override
  String get customerFilterHint => 'John Smith';

  @override
  String get catalogCardTitle => 'House Model Catalog';

  @override
  String get catalogCardSubtitle =>
      'Browse premade house models. The main difference is the area and kit components.';

  @override
  String get catalogAddButtonLabel => 'Add model';

  @override
  String get catalogMaterialListLabel => 'Kit materials categories';

  @override
  String get catalogBuildTimeLabel => 'Kit setup';
}
