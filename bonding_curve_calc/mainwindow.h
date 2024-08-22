#ifndef MAINWINDOW_H
#define MAINWINDOW_H

#include <QMainWindow>



QT_BEGIN_NAMESPACE
namespace Ui { class MainWindow; }
QT_END_NAMESPACE

class MainWindow : public QMainWindow
{
    Q_OBJECT

public:
    MainWindow(QWidget *parent = nullptr);
    ~MainWindow();

private slots:
    void on_le_buy_now_pool_sol_amount_textChanged(const QString &arg1);

    void on_le_buy_buy_sol_amount_textChanged(const QString &arg1);

    void on_le_sell_now_pool_token_amount_textChanged(const QString &arg1);

    void on_le_sell_sell_token_amount_textChanged(const QString &arg1);

private:
    void calc_buy_common();
    void calc_sell_common();
    double calc_buy_for_dy(double x, double dx);
    double calc_market_price(double x);
    double calc_sell_for_dx(double y, double dy);

private:
    Ui::MainWindow *ui;
};
#endif // MAINWINDOW_H
