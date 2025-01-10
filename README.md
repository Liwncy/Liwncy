```java
import java.time.LocalDate;

class Person {
    private String name;
    private LocalDate birthDate;

    // 构造函数：用于初始化新实例
    public Person(String name, LocalDate birthDate) {
        this.name = name;
        this.birthDate = birthDate;
    }

    // 年龄
    public int getAge() {
        LocalDate currentDate = LocalDate.now();
        return currentDate.getYear() - birthDate.getYear();
    }

    // 方法：出生
    public void lived() {
        System.out.println(name + " is " + this.getAge() + " years old.");
    }

    // 方法：学习
    public void study(LocalDate startDate, LocalDate endDate, String schoolName, String major) {
        System.out.println(name + " started attending " + schoolName + " on " + startDate + ".");
        if (endDate != null) {
            System.out.println(name + " graduated from " + schoolName + " on " + endDate + ".");
        }
    }

    // 方法：工作
    public void work(LocalDate startDate, LocalDate endDate, String jobTitle, String company) {
        System.out.println(name + " as a " + jobTitle + " at " + company + " on " + startDate + ".");
        if (endDate != null) {
            System.out.println(name + " resigned from " + company + " on " + endDate + ".");
        }
    }

    // 方法：结婚
    public void gotMarried(LocalDate date, String partnerName) {
        System.out.println(name + " got married to " + partnerName + " on " + date + ".");
    }

    // 方法：获得成就或荣誉
    public void achievedHonor(LocalDate date, String honorDescription) {
        System.out.println(name + " achieved the honor of " + honorDescription + " on " + date + ".");
    }

    // 方法：其他重要事件
    public void importantEvent(LocalDate date, String description) {
        System.out.println(name + " experienced an important event: " + description + " on " + date + ".");
    }
}

public class LifeSummary {
    public static void main(String[] args) {
        // 创建一个人物对象，代表“我”
        Person me = new Person("Liwncy", LocalDate.of(1995, 9, 9));

        // 描述我的生平简介
        me.lived();

        // 列出人生的重要节点
        me.study(LocalDate.of(2014, 9, 1), LocalDate.of(2018, 6, 15), "University", "");
        me.work(LocalDate.of(2018, 7, 1), null, "Software Engineer", "Tech Company");

        // 添加其他任何重要的生活事件
        me.importantEvent(LocalDate.of(2020, 12, 25), "Moved to a new city");

        // 结束语句
        System.out.println("That's life.");
    }
}
```