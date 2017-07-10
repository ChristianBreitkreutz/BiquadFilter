import re, string, sys, random, math, os

datei = sys.argv[1] 
in_file = open(datei,"r")
outputText = in_file.read()
in_file.close()

#rewrite formula from wxMaxima Math style to Javascript Math style

# _____________________________________________________________________________________

def parentiseAMathElement(Elementname, theText):
	tempText = ""
	posOpenBraketList = [];
	i = 0
	while (i < (len(theText))):	
		#match to Element
		#tan - atan - atan2 bool
		tanBool = True
		if(Elementname == "tan"):
			if(theText[i-1:i+len(Elementname)] == "atan"):
				tanBool = False

			if((theText[i-1:i+len(Elementname)+1]) == "atan2"):
				tanBool = False

		if(Elementname == theText[i:i+len(Elementname)] and tanBool):
			a = i+len(Elementname);
			while (True or a >= len(theText)):

				if(theText[a] == "("):
					posOpenBraketList.append(a)

				if(theText[a] == ")"):
					posOpenBraketList.pop()

					if (len(posOpenBraketList)== 0):
						a+=1;
						break;

				a+=1;

			tempText += "(Math."+theText[i:a]+")"
			i=a 
		else:
			tempText += theText[i]
			i+=1

	return tempText

# _____________________________________________________________________________________

def parentiseMantissa(theText):
	tempText = ""
	posOpenBraketList = []
	i = (len(theText)-1)
	while (i >= 0):	
		#match to Element
		if("^" == theText[i] and ")" != theText[i-1]):
			a = i;
			while (True):
				if(a < 0):
					#a-=1;
					break
					
				else:	
							
					if(theText[a] == "-" or theText[a] == "+" or theText[a] == "*" or theText[a] == "/" ):
						break
					
				a-=1;
		
			tempText += reverseString("("+theText[a+1:i]+")^")
			i=a 
		else:
			tempText += theText[i]
			i-=1

	return reverseString(tempText)


# _____________________________________________________________________________________

def parentiseExponent(theText):
	tempText = ""
	posOpenBraketList = [];
	i = 0
	while (i < (len(theText))):	
		#match to Element
		if("^" == theText[i] and "(" != theText[i+1]):

			a = i;
			while (True):
				if(a >= len(theText)):
					break
					a+=1;
				else:				
					if(theText[a] == "-" or theText[a] == "+" or theText[a] == "*" or theText[a] == "/" or theText[a] == ")"):
						break
					
				a+=1;
			tempText += "^("+theText[i+1:a]+")"
			i=a 
		else:
			tempText += theText[i]
			i+=1

	return tempText

# _____________________________________________________________________________________


def had2Pow(theText):
	tempText = ""
	posOpenBraketList = [];
	i = int(len(theText))-1
	while (i > 0):	
		if("^" == theText[i] ):
			# -- get exponent ---- 
			exponentPos = i
			mantissaPos = i
			while (True):
				if(theText[exponentPos] == "("):
					posOpenBraketList.append("void")

				if(theText[exponentPos] == ")"):
					posOpenBraketList.pop()

					if (len(posOpenBraketList)== 0):
						exponentPos+=1;
						exponent  = theText[i+2:exponentPos-1] 
						break;
				exponentPos += 1
			# -- get mantissa ---- 
			while (True):

				if(theText[mantissaPos] == ")"):
					posOpenBraketList.append("void")

				if(theText[mantissaPos] == "("):
					posOpenBraketList.pop()

					if (len(posOpenBraketList)== 0):
						# check recursiv if there ist some had left
						recursivText = had2Pow(theText[mantissaPos:i-1]);
						tempText = tempText[0:(len(tempText)-(len(exponent)+2))] + reverseString("(Math.pow((" + recursivText + "),("+exponent+")))")
						break;
				if(mantissaPos < 0):
					tempText += reverseString("<here is a wrong braket >")
					break;
				
				mantissaPos -= 1;
			i=mantissaPos-1
		else:
			tempText += theText[i]
			i-=1

	return reverseString(tempText)


# _____________________________________________________________________________________

def reverseString(s):
    return s[::-1]


# _____________________________________________________________________________________

# remove whitespaces

outputText = re.sub("\n","",outputText) # newline
outputText = re.sub(" ","",outputText) # spaces

# parenthesize every exponent
outputText = parentiseExponent (outputText)

outputText =  parentiseMantissa(outputText)

# replace %pi with Math.PI
outputText = re.sub("%pi","Math.PI",outputText)

# replace sin with Math.sin
outputText = parentiseAMathElement("sin", outputText)

# replace cos with Math.cos
outputText = parentiseAMathElement("cos", outputText)

# replace tan with Math.tan
outputText = parentiseAMathElement("tan", outputText)

# replace atan2 with Math.atan2
outputText = parentiseAMathElement("atan", outputText)

# replace atan with Math.atan
outputText = parentiseAMathElement("atan2", outputText)




outputText =  had2Pow(outputText);

# write result to output File 
out_file = open("ausgabedatei.txt","w")
out_file.write(outputText)
out_file.close()


