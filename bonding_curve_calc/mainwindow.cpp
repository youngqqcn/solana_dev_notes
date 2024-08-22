#include "mainwindow.h"
#include "./ui_mainwindow.h"
#include <QPixmap>

MainWindow::MainWindow(QWidget *parent)
    : QMainWindow(parent)
    , ui(new Ui::MainWindow)
{
    ui->setupUi(this);
    this->setWindowTitle("FanslandAI-BondingCurve-Calc");



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

