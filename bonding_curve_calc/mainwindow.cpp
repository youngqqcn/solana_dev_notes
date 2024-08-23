#include "mainwindow.h"
#include "./ui_mainwindow.h"
#include <QPixmap>
#include <QDebug>
#include <QtNumeric>
#include <QtMath>
#include <QException>

//const uint64_t DECIMALS = 1000000000;
const uint64_t DECIMALS = 1;
const double K = 1073000000 * DECIMALS;
const double V = 32190000000 * DECIMALS;


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



    QPixmap pm("./formular_1.png"); // <- path to image file
    ui->label_formular_1->setPixmap(pm);
    ui->label_formular_1->setScaledContents(true);
    ui->label_formular_1->resize(pm.size());


    QPixmap pm2("./formular_2.png"); // <- path to image file
    ui->label_formular_2->setPixmap(pm2);
    ui->label_formular_2->setScaledContents(true);
    ui->label_formular_2->resize(pm2.size());

    QPixmap pm3("./formular_3.png"); // <- path to image file
    ui->label_formular_3->setPixmap(pm3);
    ui->label_formular_3->setScaledContents(true);
    ui->label_formular_3->resize(pm3.size());

    QPixmap pm4("./formular_3.png"); // <- path to image file
    ui->label_formular_4->setPixmap(pm4);
    ui->label_formular_4->setScaledContents(true);
    ui->label_formular_4->resize(pm4.size());

}

MainWindow::~MainWindow()
{
    delete ui;
}


void MainWindow::on_le_buy_now_pool_sol_amount_textChanged(const QString &input)
{
   calc_buy_common();
}


void MainWindow::on_le_buy_buy_sol_amount_textChanged(const QString &arg1)
{
   calc_buy_common();
}

void MainWindow::calc_buy_common()
{
    if(0 == ui->le_buy_buy_sol_amount->text().trimmed().length()){
        qDebug() << "1111111";
        return;
    }
    if(0 == ui->le_buy_now_pool_sol_amount->text().trimmed().length()) {
        qDebug() << "2222222";
        return;
    }

    // convert to number
    QString pool_sol_amount_str =  ui->le_buy_now_pool_sol_amount->text();
    qDebug() << "pool_sol_amount_str: " << pool_sol_amount_str;

    bool ok = false;
    double x = pool_sol_amount_str.toDouble();
    qDebug() << "x: " << x;


    QString buy_sol_amount_str =  ui->le_buy_buy_sol_amount->text();
    double dx = buy_sol_amount_str.toDouble();
    qDebug() << "buy_sol_amount_str = " << buy_sol_amount_str;
    qDebug() << "dx: " << dx;

    // the tokens user will get
    double dy = calc_buy_for_dy(x, dx);
    ui->le_buy_will_get_token_amount->setText( QString::number(dy, 10, 10));

    // the latest market price
    double market_price = calc_market_price(x + dx);
    ui->le_buy_after_buy_market_price->setText(QString::number(market_price, 10, 10));
}



double MainWindow::calc_buy_for_dy(double x, double dx)
{
    qDebug() << "x = " << x;
    qDebug() << "dx = " << dx;
    double dy = (V * dx) / ((30 + x)*(30 + x + dx));
    qDebug() << "dy = " << QString::number(dy, 'f', 10);
    return dy;
}


double MainWindow::calc_market_price(double x)
{
    double market_price = ((30 + x)*( 30 + x)) / V;
    return market_price;
}


void MainWindow::on_le_sell_now_pool_token_amount_textChanged(const QString &arg1)
{
    calc_sell_common();
}


void MainWindow::on_le_sell_sell_token_amount_textChanged(const QString &arg1)
{
    calc_sell_common();
}

void MainWindow::calc_sell_common()
{
    if(0 == ui->le_sell_now_pool_token_amount->text().trimmed().length()){
        return;
    }
    if(0 == ui->le_sell_sell_token_amount->text().trimmed().length()) {
        return;
    }

    // convert to number
    QString pool_token_amount_str =  ui->le_sell_now_pool_token_amount->text();
    qDebug() << "pool_token_amount_str: " << pool_token_amount_str;

    double y = pool_token_amount_str.toDouble();
    qDebug() << "y: " << y;


    QString sell_token_amount_str =  ui->le_sell_sell_token_amount->text();
    double dy = sell_token_amount_str.toDouble();
    qDebug() << "sell_token_amount_str = " << sell_token_amount_str;
    qDebug() << "dy: " << dy;




    double dx = calc_sell_for_dx(y, dy);
    ui->le_sell_will_get_sol_amount->setText( QString::number(dx, 'f', 10) );

    // the latest market price
    double x_latest = V/(K - (y - dy)) - 30;
    qDebug() << "x_latest = " << QString::number(x_latest, 10, 10);
    double market_price = calc_market_price(x_latest);
    ui->le_sell_after_sell_market_price->setText(QString::number(market_price, 10, 10));
}

double MainWindow::calc_sell_for_dx(double y, double dy)
{
    qDebug() << "y = " << y;
    qDebug() << "dy = " << dy;
    double dx = (V * dy)/((K - y)*(K - y + dy));
    qDebug() << "dx = " << QString::number(dx, 'f', 10);
    return dx;
}

