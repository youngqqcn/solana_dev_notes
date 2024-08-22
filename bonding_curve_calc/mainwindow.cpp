#include "mainwindow.h"
#include "./ui_mainwindow.h"
#include <QPixmap>
#include <QDebug>
#include <QtNumeric>
#include <QtMath>
#include <QException>

//const uint64_t DECIMALS = 1000000000;
const uint64_t DECIMALS = 1;
const uint64_t K = 1073000191 * DECIMALS;
const uint64_t V = 32190000000 * DECIMALS;


MainWindow::MainWindow(QWidget *parent)
    : QMainWindow(parent)
    , ui(new Ui::MainWindow)
{
    ui->setupUi(this);
    this->setWindowTitle("FanslandAI-BondingCurve-Calc");

    qDebug() << "Minimum double value: "
                  << std::numeric_limits<double>::min();
    qDebug() << "Maximum double value: "
                  << std::numeric_limits<double>::max() ;
    qDebug() << "Smallest positive double value: "
                  << std::numeric_limits<double>::denorm_min() ;



    QPixmap pm("/home/yqq/fansland/fansland_ai/bonding_curve_calc/formular_1.png"); // <- path to image file
    ui->label_formular_1->setPixmap(pm);
    ui->label_formular_1->setScaledContents(true);
    ui->label_formular_1->resize(pm.size());


    QPixmap pm2("/home/yqq/fansland/fansland_ai/bonding_curve_calc/formular_2.png"); // <- path to image file
    ui->label_formular_2->setPixmap(pm2);
    ui->label_formular_2->setScaledContents(true);
    ui->label_formular_2->resize(pm2.size());

    QPixmap pm3("/home/yqq/fansland/fansland_ai/bonding_curve_calc/formular_3.png"); // <- path to image file
    ui->label_formular_3->setPixmap(pm3);
    ui->label_formular_3->setScaledContents(true);
    ui->label_formular_3->resize(pm3.size());

    QPixmap pm4("/home/yqq/fansland/fansland_ai/bonding_curve_calc/formular_3.png"); // <- path to image file
    ui->label_formular_4->setPixmap(pm4);
    ui->label_formular_4->setScaledContents(true);
    ui->label_formular_4->resize(pm4.size());

}

MainWindow::~MainWindow()
{
    delete ui;
}


void MainWindow::on_le_now_pool_sol_amount_textChanged(const QString &input)
{
   calc_buy_common();
}


void MainWindow::on_le_buy_sol_amount_textChanged(const QString &arg1)
{
   calc_buy_common();
}

void MainWindow::calc_buy_common()
{
    if(0 == ui->le_buy_sol_amount->text().trimmed().length()){
        return;
    }
    if(0 == ui->le_now_pool_sol_amount->text().trimmed().length()) {
        return;
    }

    // convert to number
    QString pool_sol_amount_str =  ui->le_now_pool_sol_amount->text();
    qDebug() << "pool_sol_amount_str: " << pool_sol_amount_str;

    double x = pool_sol_amount_str.toDouble();
    qDebug() << "x: " << x;


    QString buy_sol_amount_str =  ui->le_buy_sol_amount->text();
    double dx = buy_sol_amount_str.toDouble();
    qDebug() << "buy_sol_amount_str = " << buy_sol_amount_str;
    qDebug() << "dx: " << dx;

    double dy = calc_buy_for_dy(x, dx);

    ui->le_will_get_token_amount->setText( QString::number(dy, 10, 6));
}


double MainWindow::calc_buy_for_dy(double x, double dx)
{
    qDebug() << "x = " << x;
    qDebug() << "dx = " << dx;
    double dy = (V * dx) / ((30 + x)*(30 + x + dx));
    qDebug() << "dy = " << QString::number(dy, 'f', 6);
    return dy;
}

uint64_t MainWindow::calc_sell_for_dx(uint64_t y, uint64_t dy)
{
    // TODO
    return 0;
}





