package com.example.fashionshop;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class FashionShopApplication {

	public static void main(String[] args) {
		try
		{
			SpringApplication.run(FashionShopApplication.class, args);
			System.out.println("Chạy thành công");
		}

		catch (Exception e)
		{
			System.out.println("Chạy thất bại");
            e.printStackTrace();
		}

}
}
