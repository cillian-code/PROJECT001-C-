#include <iostream>
#include <string>
#include <iomanip>
#include <vector>
#include <sstream>
using namespace std;

int main()
{
    string name;
    char again = 'y';

    while (again == 'y' || again == 'Y') //loop to allow multiple students' marks input
    {
        vector<double> marks;
        double mark;
        double total = 0;
        double average;

        cout << "Student name: ";
        getline(cin, name);

        cout << "Enter your marks: ";

        string input; //declare a string to hold the entire line of input
        getline(cin, input);

        stringstream ss(input); //create a stringstream object to parse the input string

        while (ss >> mark) //loop to read marks from the stringstream
        {
            marks.push_back(mark); //store each mark in the vector
            total += mark; //calculate the total marks by summing the marks as they are entered
        }

        average = total / marks.size(); // Calculate average with increasing input size

        cout << "\nStudent: " << name << endl;
        cout << "Average: " << fixed << setprecision(2) << average << endl;

        cout << "Do you want to enter another student's marks? (y/n): ";
        cin >> again;
        cin.ignore(); // Ignore the newline character left in the input buffer
    }

    return 0;
}