package main

import (
	"testing"
)

func TestConvertToTitleCase(t *testing.T) {
	str1 := "ДЖОН ТРАВОЛТА"
	expStr1 := "Джон Траволта"
	newStr1 := ConvertToTitleCase(str1)

	if newStr1 != expStr1 {
		t.Logf("Expected %s, got %s", expStr1, newStr1)
		t.Fail()
	}
	str2 := "леонардо ди Каприо"
	expStr2 := "Леонардо Ди Каприо"
	newStr2 := ConvertToTitleCase(str2)

	if newStr2 != expStr2 {
		t.Logf("Expected %s, got %s", expStr2, newStr1)
		t.Fail()
	}
}
