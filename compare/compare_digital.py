import sys, os

class HiddenPrints:
    def __enter__(self):
        self._original_stdout = sys.stdout
        sys.stdout = open(os.devnull, 'w')

    def __exit__(self, exc_type, exc_val, exc_tb):
        sys.stdout.close()
        sys.stdout = self._original_stdout


with HiddenPrints():
    try:
        import compare
        import argparse


        parser = argparse.ArgumentParser()
        parser.add_argument("pdf1", type=str)
        parser.add_argument("pdf2", type=str)
        parser.add_argument("--exclude", type=str, default=None)
        parser.add_argument("--text_thresh", type=float, default=0.1)
        parser.add_argument("--image_thresh", type=float, default=0.4)
        parser.add_argument("--edit_distance_thresh", type=float, default=0.8)
        parser.add_argument("--equal_substring_thresh", type=int, default=12)


        args = parser.parse_args()


        result = compare.get_digital_pdf_compare_result_json(
            path1=args.pdf1,
            path2=args.pdf2,
            path3=args.exclude,
            text_thresh=args.text_thresh,
            image_thresh=args.image_thresh,
            edit_distance_thresh=args.edit_distance_thresh,
            equal_substring_thresh=args.equal_substring_thresh,
            return_text=True,
            return_image=True,
        )
    except Exception as e:
        pass


try:
    sys.stdout.write(result)
except Exception:
    pass