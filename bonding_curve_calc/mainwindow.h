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
    void on_le_now_pool_sol_amount_textChanged(const QString &arg1);

    void on_le_buy_sol_amount_textChanged(const QString &arg1);

private:
    void calc_buy_common();
    double calc_buy_for_dy(double x, double dx);
    uint64_t calc_sell_for_dx(uint64_t y, uint64_t dy);

private:
    Ui::MainWindow *ui;




};
#endif // MAINWINDOW_H
