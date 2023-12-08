import sys, os

class HiddenPrints:
    def __enter__(self):
        self._original_stdout = sys.stdout
        self._original_stderr = sys.stderr
        sys.stdout = open(os.devnull, 'w')
        sys.stderr = open(os.devnull, 'w')

    def __exit__(self, exc_type, exc_val, exc_tb):
        sys.stdout.close()
        sys.stderr.close()
        sys.stdout = self._original_stdout
        sys.stderr = self._original_stderr


with HiddenPrints():
    try:
        import compare
        import argparse


        parser = argparse.ArgumentParser()
        parser.add_argument("pdf1", type=str)
        parser.add_argument("pdf2", type=str)
        parser.add_argument("--exclude", type=str, default=None)
        parser.add_argument("--text_thresh", type=float, default=0.4)
        parser.add_argument("--filter_thresh", type=int, default=20)

        args = parser.parse_args()

        result = compare.get_scan_pdf_compare_result_json(
            pdf1=args.pdf1,
            pdf2=args.pdf2,
            pdf3=args.exclude,
            thresh=args.text_thresh,
            filter_thresh=args.filter_thresh,
            return_imgs=True,
        )
    except Exception as e:

        pass


try:
    sys.stdout.write(result)
except Exception:
    pass