#include <iostream>
#include <iomanip>
#include <string>
#include <cmath>
using namespace std;

int main()
{
    double x, a, b;
    char again='y';

while (again=='y' || again=='Y')
{
    cout << "Enter the value of a and b: ";
    cin >> a >> b;

    if (a<b)
    {
        if (a<10)
        {
            x=a+b;
            cout << "The value of x is: " << fixed << setprecision(2) << x << endl;
        }
        else
        {
            x=b-a;
            cout << "The value of x is: " << fixed << setprecision(2) << x << endl;
        }
    }
    else
    {
        if (b<5)
        {
        x=a*b;
        cout << "The value of x is: " << fixed << setprecision(2) << x << endl;
        }
        else
        {
            if(a<15)
            {
                x=pow(a,2);
                cout << "The value of x is: " << fixed << setprecision(2) << x << endl;
            }
            else
            {
                x=pow(b,2);
                cout << "The value of x is: " << fixed << setprecision(2) << x << endl;
            }
        }
    

    }
    cout << "Do you want to continue? (y/n): ";
    cin >> again;
}
return 0;
}