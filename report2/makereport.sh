#!/bin/bash

pdflatex report.tex
bibtex report.aux
pdflatex report.tex
pdflatex report.tex
pdflatex report.tex