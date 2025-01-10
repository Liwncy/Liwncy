<!---
Liwncy/Liwncy is a ✨ special ✨ repository because its `README.md` (this file) appears on your GitHub profile.
You can click the Preview link to take a look at your changes.
--->
```java
import java.time.LocalDate;
import java.time.Period;

class Person {
    private String name;
    private LocalDate birthDate;
    private int age;
    private boolean isAlive = true;

    // 构造函数：用于初始化新实例
    public Person(String name, LocalDate birthDate) {
        this.name = name;
        this.birthDate = birthDate;
        this.age = calculateAge(birthDate);
        System.out.println(name + " was born on " + birthDate + ".");
    }

    // 计算年龄的方法
    private int calculateAge(LocalDate birthDate) {
        return Period.between(birthDate, LocalDate.now()).getYears();
    }

    // 生日庆祝方法
    public void celebrateBirthday() {
        age++;
        System.out.println("Happy Birthday, " + name + "! You are now " + age + " years old.");
    }

    // 学习方法
    public void study() {
        System.out.println(name + " is studying hard.");
    }

    // 工作方法
    public void work() {
        if (age >= 18 && age < 65) {
            System.out.println(name + " goes to work every day.");
        } else {
            System.out.println(name + " is not working at the moment.");
        }
    }

    // 退休方法
    public void retire() {
        if (age >= 65) {
            System.out.println(name + " has retired and enjoys leisure time.");
        } else {
            System.out.println(name + " is too young to retire.");
        }
    }

    // 死亡方法
    public void die() {
        if (isAlive) {
            isAlive = false;
            System.out.println(name + " has passed away at the age of " + age + ".");
        } else {
            System.out.println(name + " has already passed away.");
        }
    }

    // 获取当前年龄
    public int getAge() {
        return age;
    }

    // 检查是否活着
    public boolean isAlive() {
        return isAlive;
    }
}

public class LifeStage {
    public static void main(String[] args) {
        // 创建一个人物
        Person person = new Person("Liwncy", LocalDate.of(1995, 9, 9));

        // 模拟人生阶段
        for (int i = 0; i <= 80; i++) {
            if (!person.isAlive()) break;

            // 庆祝生日
            person.celebrateBirthday();

            // 根据年龄执行不同的活动
            if (i >= 5 && i < 18) {
                person.study();
            } else if (i >= 18 && i < 65) {
                person.work();
            } else if (i >= 65) {
                person.retire();
            }

            // 随机事件（如疾病等可能导致早逝）
            if (Math.random() < 0.02 && person.isAlive()) { // 2%几率
                person.die();
            }
        }

        // 如果到了80岁还没有去世，则自然死亡
        if (person.isAlive()) {
            person.die();
        }
    }
}
```
